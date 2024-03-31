import Vue from 'vue';
import App from './test/testcase.vue';
import store from './store'; // 引入 Vuex store 

import VueRouter from 'vue-router';

Vue.use(VueRouter);

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
