// store.js 或 index.js，取决于您的项目结构

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    valuesInForm: {}
  },
  mutations: {
    // 更新表单值的 mutation
    UPDATE_VALUE(state, { id, value }) {
      Vue.set(state.valuesInForm, id, value);
    }
  },
  actions: {
    // 可以异步地调用这个 action 来更新值
    updateValue({ commit }, payload) {
      commit('UPDATE_VALUE', payload);
    }
  },
  getters: {
    // 获取指定 ID 的表单值
    getValue: (state) => (id) => {
      return state.valuesInForm[id];
    }
  }
});
