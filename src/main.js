import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import VueCryptojs from 'vue-cryptojs'
import QrReader from 'vue3-qr-reader';
import VueQrcode from '@chenfengyuan/vue-qrcode';


const app = createApp(App).use(router)
  .use(vuetify)
  .use(QrReader)
  .use(VueCryptojs);
app.mount('#app');


app.component(VueQrcode.name, VueQrcode);

