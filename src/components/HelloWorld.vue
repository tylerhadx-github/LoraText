<!-- eslint-disable no-unused-vars -->
<template>
  <div class="lora">
    <v-snackbar v-model="snackbar" :timeout="3000" color="error">
      Device connection lost
    </v-snackbar>

    <div class="lora__wrap">
      <!-- Connection + controls -->
      <section class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <span class="panel__eyebrow">Radio link</span>
            <h2>Pair your LoRa radio</h2>
          </div>
          <span
            class="connpill"
            :class="isDeviceConnected ? 'connpill--on' : 'connpill--off'"
          >
            <span class="connpill__dot"></span>
            {{ isDeviceConnected ? 'Connected' : 'Not paired' }}
          </span>
        </div>

        <div class="panel__row">
          <button
            v-if="!isDeviceConnected"
            class="btn btn--primary"
            @click="newBLEConnection()"
          >
            <i class="mdi mdi-bluetooth"></i> Pair Bluetooth device
          </button>
          <button v-else class="btn btn--ghost" @click="disconnect">
            <i class="mdi mdi-bluetooth-off"></i> Disconnect
          </button>

          <p v-if="device" class="devicename">
            <i class="mdi mdi-radio-tower"></i> {{ device.name }}
          </p>
        </div>

        <div class="panel__row panel__row--wrap">
          <button
            v-if="!notificationPermission"
            class="chipbtn"
            @click="requestBackgroundSync()"
          >
            <i class="mdi mdi-bell-outline"></i> Background notifications
          </button>
          <button class="chipbtn" @click="toggleMap()" :disabled="!device">
            <i class="mdi mdi-map-outline"></i>
            <span v-if="showMap">Hide map</span><span v-else>Show map</span>
          </button>
          <button
            class="chipbtn"
            :class="{ 'chipbtn--active': shareLocation }"
            @click="shareLocation = !shareLocation"
            :disabled="!device"
          >
            <i class="mdi mdi-crosshairs-gps"></i> Share location
          </button>
          <button
            class="chipbtn"
            @click="
              sendingTimestamps = !sendingTimestamps;
              timeStampMessageSender(sendingTimestamps);
            "
            :disabled="!device"
          >
            <i class="mdi mdi-clock-outline"></i>
            <span v-if="sendingTimestamps">Stop timestamps</span>
            <span v-else>Send timestamps</span>
          </button>
          <button class="chipbtn chipbtn--danger" @click="clearStorage()">
            <i class="mdi mdi-trash-can-outline"></i> Clear storage
          </button>
        </div>
      </section>

      <!-- Key exchange -->
      <section class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <span class="panel__eyebrow">Encryption</span>
            <h2>Pre-shared key</h2>
          </div>
          <span class="connpill connpill--key">
            <i class="mdi mdi-lock-outline"></i> Private by design
          </span>
        </div>

        <div class="keyrow">
          <v-text-field
            label="Pre-shared key"
            variant="outlined"
            density="comfortable"
            hide-details
            v-model="sharedKey"
            class="keyfield"
          ></v-text-field>

          <div class="keyrow__actions">
            <button class="btn btn--primary" @click="generateKey()" v-if="!sharedKey">
              <i class="mdi mdi-key-variant"></i> Generate key
            </button>

            <QRCreator v-if="sharedKey" :sharedKey="sharedKey"></QRCreator>
            <qrreader
              v-if="!sharedKey"
              @sharedKeyRecieved="
                (msg) => {
                  sharedKey = msg;
                  scanKey = false;
                }
              "
            ></qrreader>
          </div>
        </div>
        <p class="keyhint">
          <i class="mdi mdi-shield-key-outline"></i>
          Everyone in your group needs the same key. Share it with the QR code -
          messages are encrypted with it before they ever hit the radio.
        </p>
      </section>

      <!-- Message thread -->
      <section class="thread" v-if="!affirmRefresh">
        <div v-if="messages.length === 0" class="thread__empty">
          <i class="mdi mdi-message-lock-outline"></i>
          <p>No messages yet. Pair a radio, set a key, and say hello off-grid.</p>
        </div>

        <div
          v-for="m in messages"
          :key="m.id"
          class="msgrow"
          :class="{ 'msgrow--you': m.yours }"
        >
          <template v-if="m.yours">
            <div class="bubble bubble--you" v-if="!m.isLocation && !m.isPin">
              <span class="bubble__text">{{ decryptMessage(m, m.sharedKey) }}</span>
              <span class="bubble__meta">
                <i class="mdi mdi-lock bubble__lock"></i>
                <i v-if="m.recieved" class="mdi mdi-check-all bubble__ack"></i>
              </span>
            </div>
            <div
              class="bubble__sending"
              v-if="!m.recieved && !shouldRetry(m.sentDate) && !m.isLocation"
            >
              <v-progress-linear
                color="primary"
                height="4"
                rounded
                indeterminate
              ></v-progress-linear>
            </div>
            <div
              class="bubble__retry"
              v-else-if="
                !m.recieved &&
                shouldRetry(m.sentDate) &&
                !m.isLocation &&
                !m.isPin
              "
            >
              <button class="iconbtn" title="Retry" @click="addToQueue(m)">
                <i class="mdi mdi-replay"></i> Retry
              </button>
              <button class="iconbtn iconbtn--danger" title="Delete" @click="removeFromQueue(m)">
                <i class="mdi mdi-delete"></i>
              </button>
            </div>
          </template>

          <template v-else>
            <div class="bubble bubble--them" v-if="!m.isLocation">
              <span class="bubble__text">{{ decryptMessage(m, m.sharedKey) }}</span>
              <span class="bubble__meta">
                <i class="mdi mdi-lock-open-check bubble__lock"></i>
              </span>
            </div>
          </template>
        </div>
      </section>

      <!-- Composer -->
      <section class="composer">
        <v-text-field
          v-model="tempMessage"
          append-icon="mdi-send"
          :disabled="!device && stillSending"
          variant="solo-filled"
          density="comfortable"
          clear-icon="mdi-close-circle"
          clearable
          hide-details
          label="Message"
          type="text"
          @click:append="prepareMessage(tempMessage, false, false)"
          @keydown.enter="prepareMessage(tempMessage, false, false)"
          maxlength="180"
          counter
        ></v-text-field>
      </section>

      <!-- Map -->
      <section class="mapwrap" v-if="showMap">
        <div class="mapwrap__head">
          <span class="panel__eyebrow">Off-grid map</span>
          <h2>Live group locations</h2>
        </div>
        <MapVue
          :shareLocationUpdates="shareLocation"
          :dataProp="parentData"
          :otherPin="otherPinSent"
          @messageSent="
            (msg) => {
              prepareMessage(msg, true, false);
            }
          "
          @pinSent="
            (msg) => {
              prepareMessage(msg, false, true);
            }
          "
        ></MapVue>
      </section>
    </div>
  </div>
</template>
  
  <script>
import MapVue from "./Map.vue";
import messageStore from "@/utils/messages";
import qrreader from "./QRReader.vue";
import QRCreator from "./QRCreator.vue";

export default {
  name: "HelloWorld",
  components: { MapVue, qrreader, QRCreator },
  setup() {},
  data: () => ({
    sendingTimestamps: false,
    scanKey: false,
    device: null,
    sharedKey: null,
    tempMessage: null,
    showMsg: false,
    notificationPermission: false,
    lastMessageRecieved: "",
    showMap: false,
    parentData: { lat: null, long: null },
    otherPinSent: { lat: null, long: null },
    isDeviceConnected: false,
    intervalTimestamp: 15000,
    testing: false,
    snackbar: false,
    server: null,
    strBuild: null,
    messageQueue: [],
    isSending: false,
    recievingMessage: false,
    haveStart: false,
    tempID: null,
    affirmRefresh: false,
    progress: 0,
    startTime: null,
    messageType: 0, //0=msg, 1= pin , 2 = location
    shareLocation: false,
  }),
  created() {},
  mounted() {
    const storedObject = localStorage.getItem("messages");
    if (storedObject) {
      messageStore.setMessages(JSON.parse(storedObject));
    }

    this.intervalID = setInterval(() => {
      this.affirmRefresh = true;
      this.saveMessagesToStorage();
      this.affirmRefresh = false;
    }, 20000);
  },
  methods: {
    generateKey() {
      this.sharedKey = messageStore.makeid(200);
    },
    async newBLEConnection() {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ["00006969-0000-1000-8000-00805f9b34fb"] },
          //,'00007070-0000-1000-8000-00805f9b34fb'
        ],
        optionalServices: ["00007070-0000-1000-8000-00805f9b34fb"],
      });

      this.server = await this.device.gatt.connect();

      const service = await this.server.getPrimaryService(
        "00007070-0000-1000-8000-00805f9b34fb"
      );
      const characteristic = await service.getCharacteristic(
        "00006789-0000-1000-8000-00805f9b34fb"
      );
      await characteristic.startNotifications();
      characteristic.addEventListener(
        "characteristicvaluechanged",
        this.getMessageFromBluetoothService
      );

      this.isDeviceConnected = true;

      this.device.addEventListener(
        "gattserverdisconnected",
        this.onDisconnected
      );
    },
    async disconnect() {
      try {
        await this.characteristic.stopNotifications();
        this.characteristic.removeEventListener(
          "characteristicvaluechanged",
          this.onDataReceived
        );
        this.connected = false;
      } catch (error) {
        console.error(error);
      }
    },
    async timer(ms) {
      await new Promise((resolve) => setTimeout(resolve, ms));
    },
    onDisconnected() {
      this.isDeviceConnected = false;
      this.snackbar = true;
    },
    async getMessageFromBluetoothService(event) {
      try {
        this.recievingMessage = true;

        let value = event.target.value;
        var enc = new TextDecoder("utf-8");
        var msg = enc.decode(value);
        console.log(msg);

        if (msg.startsWith("A|")) {
          //ack msg recieved
          if (msg.length > 2) {
            var ID = msg.substring(2);
            var localMessages = messageStore.getMessages().filter((x) => x.id == ID);
            if(localMessages.length>0){
              localMessages[0].recieved = true;
            }
            else{
              console.log("recived a affirm but cannot find id?");
            }
            this.recievingMessage = false;
            this.affirmRefresh = true;
            this.$forceUpdate();
            this.affirmRefresh = false;
          }
        } else if (msg.startsWith("LID|")) {
          this.messageType = 2;
          this.strBuild = "";
          this.tempID = msg.substring(4);
        } else if (msg.startsWith("PID|")) {
          this.messageType = 1;
          this.strBuild = "";
          this.tempID = msg.substring(4);
        } else if (msg.startsWith("MID|")) {
          this.messageType = 0;
          this.strBuild = "";
          this.tempID = msg.substring(4);
        } else if (msg.startsWith("0|")) {
          this.haveStart == true;
          this.strBuild = this.strBuild + msg.substring(2);
        } else if (msg.startsWith("*|")) {
          var x = messageStore.getNewMessage(
            false,
            this.strBuild + msg.substring(2),
            false,
            this.sharedKey,
            false
          );
          if (this.tempID != null) {
            x.id = this.tempID;
          }
          //look for only + at the start
          if (!msg.substring(0, 2).includes("+")) {
            //send ack
            if (this.messageType == 0) {
              messageStore.pushMessage(x);
              await this.sendMessage("A|" + x.id);
              await this.timer(1500);
            } else if (this.messageType == 1) {
              x.isPin = true;
              this.decryptMessage(x, x.sharedKey); //detect lat long but not flash messages anymore
            } else {
              x.isLocation = true;
              this.decryptMessage(x, x.sharedKey); //detect lat long but not flash messages anymore
            }
            this.recievingMessage = false;
            this.tempID = null;
          }
          if (document.hidden) {
            this.createNotification();
          }
          this.strBuild = "";
        } else {
          this.strBuild = this.strBuild + msg.substring(2);
        }
      } catch (ex) {
        console.log(ex);
      }
    },
    async sendMessage(msg) {
      var service = await this.server.getPrimaryService(
        "00006969-0000-1000-8000-00805f9b34fb"
      );
      var stringCharacteristics = await service.getCharacteristic(
        "00009876-0000-1000-8000-00805f9b34fb"
      );
      var enc = new TextEncoder(); // always utf-8
      await stringCharacteristics.writeValueWithResponse(enc.encode(msg));
    },
    async batchSendMessage() {
      this.isSending = true;
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue[0];
        //try to not talk over each other
        if (!this.recievingMessage) {
          try {
            // MID= message id
            // LID= Location ID
            // PID = Pin ID       all message id's just no need to render
            if (!message.isLocation && !message.isPin) {
              await this.sendMessage("MID|" + message.id);
            } else if (message.isPin) {
              await this.sendMessage("PID|" + message.id);
            } else {
              await this.sendMessage("LID|" + message.id);
            }

            await this.timer(1200);

            var msg = message.text;
            if (msg.length < 30) {
              await this.sendMessage("*|" + msg);
              this.messageQueue.shift();
            } else {
              if (msg.length < 301) {
                //try to break them into ten messages 30 chars with 0| 1| and count down
                var batch = msg.match(/.{1,30}/g);
                console.log(batch);
                await this.loopMessage(batch);
                this.messageQueue.shift();
              }
            }
          } catch (error) {
            console.error(error);
            if (message.retries > 0) {
              // Decrement retries and add message to end of queue
              message.retries--;
              this.messageQueue.push(message);
            } else {
              // Remove message from queue if retries are exhausted
              this.messageQueue.shift();
            }
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
          this.recievingMessage = false;
        }
      }
      this.isSending = false;
    },
    async loopMessage(batch) {
      for (var i = 0; i < batch.length; i++) {
        var prefix = i;
        if (i == batch.length - 1) {
          prefix = "*";
        }
        await this.sendMessage(prefix + "|" + batch[i]);
        await this.timer(1200);
      }
    },
    createNotification() {
      const title = "Lora Recieved New Message";
      const img = "/img/lora.png";
      const options = {
        body: "Message Recieved",
        icon: img,
      };

      new Notification(title, options);
    },
    timeStampMessageSender(sending) {
      var _this = this;
      this.testing = true;

      if (!sending) {
        clearInterval(this.intervalID);
        this.sendingTimestamps = false;
      } else {
        this.sendingTimestamps = true;
        // send one right away
        this.prepareMessage(
          "Timestamp Test Message " +
            new Date().toLocaleString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            }),
          false,
          false
        );

        this.intervalID = setInterval(function () {
          _this.prepareMessage(
            "Timestamp Test Message " +
              new Date().toLocaleString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
                hour12: true,
              }),
            false,
            false
          );
        }, this.intervalTimestamp);
      }
    },
    toggleMap() {
      this.showMap = !this.showMap;
    },
    prepareMessage(msg, isLatLong = false, isPin = false) {
      var x = messageStore.getNewMessage(
        true,
        this.hashMessage(msg),
        isLatLong,
        this.sharedKey,
        false,
        isPin
      );
      messageStore.pushMessage(x);
      this.saveMessagesToStorage();

      this.addToQueue(x);
      if (!isLatLong && !this.testing) {
        //location updates wont remove your message
        //and so timestamp message gen doesnt remove your message
        this.tempMessage = null;
      }
    },
    addToQueue(x) {
      this.messageQueue.push(x);
      this.batchSendMessage(x);
    },
    removeFromQueue(x){
     messageStore.removeMessage(x);
    },
    requestBackgroundSync() {
      Notification.requestPermission((permission) => {
        if (permission === "granted") {
          this.registerBackgroundSync();
          this.notificationPermission = true;
        } else console.error("Permission was not granted.");
      });
    },
    registerBackgroundSync() {
      if (!navigator.serviceWorker) {
        return console.error("Service Worker not supported");
      }

      navigator.serviceWorker.ready
        .then((registration) => registration.sync.register("syncMessages"))
        .then(() => console.log("Registered background sync"))
        .catch((err) =>
          console.error("Error registering background sync", err)
        );
    },
    hashMessage(str) {
      var iv = this.$CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
      const encryptedText = this.$CryptoJS.AES.encrypt(
        str,
        this.sharedKey,
        {iv: iv}
      ).toString();
      return encryptedText;
    },
    decryptMessage(message, savedSharedKey) {
      try {
        const decryptedText = this.$CryptoJS.AES.decrypt(
          message.text,
          savedSharedKey
        ).toString(this.$CryptoJS.enc.Utf8);

        if (!message.isProccessed) {
          message.isProccessed = true;
          if (this.detectLatLong(decryptedText, message.isPin)) {
            message.isLocation = true;
          }
        }

        return decryptedText;
      } catch (ex) {
        //messages = messages.filter((x) => x.Id !== message.Id);
        console.log("message not decrypted: " + ex);
        return null;
      }
    },
    detectLatLong(message, isPin) {
      const regex =
        /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
      const match = message.match(regex);

      if (match) {
        const lat = parseFloat(match[1]);
        let long = match[4];

        if (match[0].includes(",-")) {
          long = "-" + long;
        }

        if (isPin) {
          this.otherPinSent.lat = null;
          this.otherPinSent.long = null;
          var tempPin = { lat: lat, long: long };
          this.otherPinSent = tempPin;
        } else {
          this.parentData.lat = null;
          this.parentData.long = null;
          var temp = { lat: lat, long: long };
          this.parentData = temp;
        }

        console.log(`Latitude: ${lat}, Longitude: ${long}`);
      } else {
        //console.log("No latitude and longitude found in string.");
      }
      return match;
    },
    saveMessagesToStorage() {
      if (!this.recievingMessage) {
        var savedM = messageStore.getMessages();
        savedM.forEach((x) => {
          if (x.sharedKey == null) {
            x.sharedKey = this.sharedKey;
          }
        });
        //writing shared key to local storage
        if (savedM.length > 0) {
          localStorage.setItem("messages", JSON.stringify(savedM));
          console.log("saved messages to local storage");
        }
      }
    },
    clearStorage() {
      if (window.confirm("Are you sure you want to delete this chat thread?")) {
      localStorage.removeItem("messages");
      this.messages = [];
      window.location.reload();
      }
    },
    shouldRetry(dt) {
      let oldDate = new Date();
      if (Date.parse(dt)) {
        oldDate = new Date(dt);
      }
      const now = new Date();
      const past = new Date(now.getTime() - 20000);
      if (oldDate.getTime() < past.getTime()) {
        return true;
      } else {
        return false;
      }
    },
  },
  watch: {
    messages: {
      handler(newVal) {
        console.log("messages has changed:", newVal);
      },
      deep: true, // watch for nested changes
    },
  },
  computed: {
    messages() {
      return messageStore.getMessages();
    },
    stillSending() {
      return this.isSending;
    },
  },
};
</script>
  
<style scoped>
.lora {
  min-height: calc(100vh - 52px);
  padding: 1.25rem 1rem 6rem;
}

.lora__wrap {
  max-width: 820px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Panels */
.panel {
  padding: 1.25rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    radial-gradient(120% 120% at 100% 0%, color-mix(in srgb, #7c5cff 10%, transparent), transparent 55%),
    rgba(255, 255, 255, 0.025);
}

.panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.1rem;
}

.panel__eyebrow {
  display: block;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #7c5cff;
  margin-bottom: 0.25rem;
}

.panel__title h2 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.01em;
  margin: 0;
  color: #f4f4f8;
}

.panel__row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.panel__row + .panel__row {
  margin-top: 0.9rem;
}

.panel__row--wrap {
  gap: 0.5rem;
}

/* Connection pill */
.connpill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.32rem 0.7rem;
  border-radius: 999px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.connpill__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.connpill--on {
  color: #3ddc97;
  background: rgba(61, 220, 151, 0.12);
  border-color: rgba(61, 220, 151, 0.4);
}

.connpill--on .connpill__dot {
  background: #3ddc97;
  box-shadow: 0 0 10px #3ddc97;
}

.connpill--off {
  color: #a7a7b4;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

.connpill--off .connpill__dot {
  background: #8a8a99;
}

.connpill--key {
  color: #b89bff;
  background: rgba(124, 92, 255, 0.12);
  border-color: rgba(124, 92, 255, 0.4);
}

.devicename {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: #a7a7b4;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.25rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
}

.btn--primary {
  background: linear-gradient(120deg, #7c5cff, #6344e6);
  color: #fff;
  box-shadow: 0 10px 28px rgba(124, 92, 255, 0.4);
}

.btn--primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(124, 92, 255, 0.55);
}

.btn--ghost {
  color: #f4f4f8;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.btn--ghost:hover {
  transform: translateY(-3px);
  border-color: rgba(124, 92, 255, 0.7);
}

.chipbtn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  color: #c9c9d6;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.chipbtn:hover:not(:disabled) {
  transform: translateY(-2px);
  color: #fff;
  border-color: rgba(124, 92, 255, 0.6);
}

.chipbtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.chipbtn--active {
  color: #3ddc97;
  border-color: rgba(61, 220, 151, 0.5);
  background: rgba(61, 220, 151, 0.1);
}

.chipbtn--danger:hover:not(:disabled) {
  color: #ff5d73;
  border-color: rgba(255, 93, 115, 0.6);
}

/* Key exchange */
.keyrow {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.keyfield {
  flex: 1;
  min-width: 220px;
}

.keyrow__actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.keyhint {
  margin: 1rem 0 0;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #8a8a99;
}

.keyhint .mdi {
  color: #7c5cff;
  margin-top: 1px;
}

/* Thread */
.thread {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.thread__empty {
  text-align: center;
  color: #6f6f7e;
  padding: 2.5rem 1rem;
}

.thread__empty .mdi {
  font-size: 2.4rem;
  color: #3a3a48;
}

.thread__empty p {
  margin: 0.75rem 0 0;
  font-size: 0.95rem;
}

.msgrow {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 78%;
}

.msgrow--you {
  align-self: flex-end;
  align-items: flex-end;
}

.bubble {
  display: inline-flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.7rem 0.95rem;
  border-radius: 18px;
  font-size: 0.95rem;
  line-height: 1.45;
  word-break: break-word;
  border: 1px solid transparent;
}

.bubble__text {
  white-space: pre-wrap;
}

.bubble--you {
  background: linear-gradient(120deg, #7c5cff, #6344e6);
  color: #fff;
  border-bottom-right-radius: 6px;
  box-shadow: 0 8px 22px rgba(124, 92, 255, 0.3);
}

.bubble--them {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: #f4f4f8;
  border-bottom-left-radius: 6px;
}

.bubble__meta {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  flex: none;
}

.bubble__lock {
  font-size: 0.85rem;
  opacity: 0.7;
}

.bubble--them .bubble__lock {
  color: #3ddc97;
  opacity: 0.9;
}

.bubble__ack {
  font-size: 1rem;
  color: #b6ffdf;
}

.bubble__sending {
  width: 120px;
  margin-top: 0.35rem;
}

.bubble__retry {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.iconbtn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  color: #ffb454;
  background: rgba(255, 180, 84, 0.1);
  border: 1px solid rgba(255, 180, 84, 0.4);
  transition: background 0.2s ease;
}

.iconbtn:hover {
  background: rgba(255, 180, 84, 0.2);
}

.iconbtn--danger {
  color: #ff5d73;
  background: rgba(255, 93, 115, 0.1);
  border-color: rgba(255, 93, 115, 0.4);
}

.iconbtn--danger:hover {
  background: rgba(255, 93, 115, 0.2);
}

/* Composer */
.composer {
  position: sticky;
  bottom: 1rem;
  padding: 0.6rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(20, 20, 28, 0.92);
  backdrop-filter: blur(12px);
}

/* Map */
.mapwrap {
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.025);
}

.mapwrap__head {
  padding: 1.1rem 1.25rem 0.85rem;
}

.mapwrap__head h2 {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
  margin: 0;
  color: #f4f4f8;
}

@media (max-width: 560px) {
  .msgrow {
    max-width: 88%;
  }
}
</style>
  