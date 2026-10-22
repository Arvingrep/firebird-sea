import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { NavBar, Tabbar, TabbarItem, Loading, Button, Empty, Card, Tag, Tabs, Tab, Cell, SubmitBar, Stepper, NoticeBar, RadioGroup, Radio, Dialog, Field } from 'vant';
import 'vant/lib/index.css';
import App from './App.vue';
import router from './router';
import { initTelegram } from './telegram';
import './style.css';

initTelegram();
const app = createApp(App).use(createPinia()).use(router);
// 按需注册 Vant 组件（不引入额外的自动导入插件，遵守 Zero-Dep）
[NavBar, Tabbar, TabbarItem, Loading, Button, Empty, Card, Tag, Tabs, Tab, Cell, SubmitBar, Stepper, NoticeBar, RadioGroup, Radio, Dialog, Field].forEach((c) => app.use(c));
app.mount('#app');
