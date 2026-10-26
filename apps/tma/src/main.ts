import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Loading, Field, Popup } from 'vant';
import 'vant/lib/index.css';
import App from './App.vue';
import router from './router';
import { initTelegram } from './telegram';
import './style.css';

initTelegram();
const app = createApp(App).use(createPinia()).use(router);
// 按需注册 Vant 组件（不引入额外的自动导入插件，遵守 Zero-Dep）。
// 视觉层已全部自绘，只保留确有必要的三个：加载态、输入框、底部弹层。
[Loading, Field, Popup].forEach((c) => app.use(c));
app.mount('#app');
