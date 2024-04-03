import Vue from 'vue';
// import App from './test/testcase.vue';
import App from './test/eleUITestcase1.vue';
import store from './store'; // 引入 Vuex store 
import VueRouter from 'vue-router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(VueRouter);
Vue.use(ElementUI);

const router = new VueRouter({
  mode: 'history',
  routes: [
    // 定义你的路由
  ]
});

new Vue({
  router,
  store,
  el: '#app',
  render: h => h(App)
});

//以下代码用于临时调试或测试
// console.log(`HOST:${process.env['API_URL']}`);
// import {testcase_group_1} from './test/testcase_parseTemplate'
// testcase_group_1();