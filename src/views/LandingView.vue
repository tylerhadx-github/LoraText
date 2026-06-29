<template>
  <div class="landing">
    <BrandNav />

    <main>
      <LoraHero />

      <FeatureSection
        anchor="how"
        eyebrow="How it works"
        title="Your phone talks, the radio carries"
        subtitle="LoraText turns your phone into an off-grid terminal. Messages are encrypted on-device, handed to a LoRa radio over Bluetooth, and travel for miles with no cell network in sight."
        :items="howItems"
      />

      <FeatureSection
        anchor="pair"
        eyebrow="Pair & message"
        title="Encrypted group chat, off the grid"
        subtitle="Pair your radio, share a key, and start texting. Everything is private by design."
        :items="pairItems"
      />

      <OffGridMap />

      <FeatureSection
        anchor="kit"
        eyebrow="Build the kit"
        title="A maker kit anyone can build"
        subtitle="Full stack and fully open: a custom PCB, Arduino/C++ firmware, this PWA, and a 3D-printable enclosure. Build one for your whole crew."
        :items="kitItems"
      />

      <FeatureSection
        anchor="open-source"
        eyebrow="Open source"
        title="Open hardware, open software"
        subtitle="No black boxes and no app store. Everything is open so a small group can build, audit, and run their own off-grid network."
        :items="openItems"
      />

      <WorksOffline />

      <BrandCTA />
    </main>
  </div>
</template>

<script setup>
  import BrandNav from '@/components/brand/BrandNav.vue'
  import LoraHero from '@/components/brand/LoraHero.vue'
  import FeatureSection from '@/components/brand/FeatureSection.vue'
  import OffGridMap from '@/components/brand/OffGridMap.vue'
  import WorksOffline from '@/components/brand/WorksOffline.vue'
  import BrandCTA from '@/components/brand/BrandCTA.vue'

  const howItems = [
    {
      icon: 'mdi-lock-outline',
      title: 'Encrypt on-device',
      blurb: 'Every message is encrypted with your group pre-shared key before it ever leaves your phone.',
      accent: '#7c5cff',
    },
    {
      icon: 'mdi-bluetooth',
      title: 'Hand off to the radio',
      blurb: 'The PWA pairs to your LoRa radio over Web Bluetooth and streams the encrypted payload to it.',
      accent: '#5ab0ff',
    },
    {
      icon: 'mdi-radio-tower',
      title: 'Travel off-grid',
      blurb: 'LoRa carries the message for miles on license-free radio - no cell tower, no Wi-Fi, no internet.',
      accent: '#3ddc97',
    },
    {
      icon: 'mdi-lock-open-check-outline',
      title: 'Decrypt for the group',
      blurb: 'Anyone holding the same key receives and decrypts the message. Everyone else just sees noise.',
      accent: '#ffb454',
    },
  ]

  const pairItems = [
    {
      icon: 'mdi-bluetooth-connect',
      title: 'Pair over Bluetooth',
      blurb: 'Tap to connect your radio. Connection state is always visible, with a clean reconnect if you wander out of range.',
      accent: '#5ab0ff',
      badge: 'Live',
      badgeType: 'live',
    },
    {
      icon: 'mdi-message-lock-outline',
      title: 'Encrypted chat',
      blurb: 'A familiar dark chat with delivery status and retries - except every bubble is end-to-end pre-shared-key encrypted.',
      accent: '#7c5cff',
      badge: 'Private',
      badgeType: 'open',
    },
    {
      icon: 'mdi-qrcode-scan',
      title: 'Share the key by QR',
      blurb: 'Generate a key and pass it around your group with a scannable QR code - no typing 200 characters by hand.',
      accent: '#3ddc97',
      badge: 'Live',
      badgeType: 'live',
    },
  ]

  const kitItems = [
    {
      icon: 'mdi-chip',
      title: 'Custom PCB',
      blurb: 'A compact board carrying an Arduino Nano 33 BLE and a Reyax RYLR998 LoRa module, with a LiPo battery, on/off switch and USB charge controller - the radio brain of the whole system.',
      accent: '#7c5cff',
      badge: 'Open hardware',
      badgeType: 'open',
    },
    {
      icon: 'mdi-code-braces',
      title: 'Arduino / C++ firmware',
      blurb: 'Firmware that bridges Bluetooth and LoRa, handles message framing, acks, and retries on the wire.',
      accent: '#5ab0ff',
      badge: 'Open source',
      badgeType: 'open',
    },
    {
      icon: 'mdi-cellphone-cog',
      title: 'This PWA',
      blurb: 'The offline-first app you are looking at - install it, pair, and message. No store, no account.',
      accent: '#3ddc97',
      badge: 'Live',
      badgeType: 'live',
    },
    {
      icon: 'mdi-printer-3d',
      title: '3D-printed enclosure',
      blurb: 'A rugged printable case so the radio survives the trail. Print one per person and hit the backcountry.',
      accent: '#ffb454',
      badge: 'In progress',
      badgeType: 'progress',
    },
  ]

  const openItems = [
    {
      icon: 'mdi-github',
      title: 'All on GitHub',
      blurb: 'PCB design, firmware, app, and case files are open - clone it, build it, improve it.',
      accent: '#7c5cff',
      badge: 'Open source',
      badgeType: 'open',
      foot: 'View the repo',
      href: 'https://github.com/',
    },
    {
      icon: 'mdi-shield-check-outline',
      title: 'Auditable security',
      blurb: 'Pre-shared-key encryption with nothing hidden. Read the code, verify the crypto, trust your own build.',
      accent: '#3ddc97',
    },
    {
      icon: 'mdi-account-group-outline',
      title: 'Built by anyone',
      blurb: 'Designed so a small group can build their own network for a weekend trip or an emergency kit.',
      accent: '#5ab0ff',
    },
  ]
</script>

<style scoped>
  .landing {
    width: 100%;
    overflow-x: hidden;
  }
</style>
