<template>
  <div v-if="visible">
    <div v-for="option in options" :key="option.value">
      <input
        type="radio"
        :id="option.value"
        :value="option.value"
        v-model="selectedValue"
        @change="updateValueEvent"
      />
      <label :for="option.value">{{ option.label }}</label>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { EventBus } from '../eventBus.js';
import {initDisabled,initVisible} from '../util';
export default {
  props: ['id', 'properties'],
  data() {
    return {
      options: [], // 可选值列表
      visible: true, // 控制组件的可见性
      selectedValue: '', // 当前选中的值
      disabled: false, // 添加disabled属性，默认为false，表示组件未被禁用
    };
  },
  computed: {
    ...mapGetters(['getValue']), // 从vuex中获取用户已从表单中填写的值
  },
  created() {
    // 初始化组件状态
    this.initFromProperties();

    // 注册事件侦听器
    EventBus.$on('GoingtoChangeRadioValue', ({ id, value }) => {
      if (id === this.id) {
        this.selectedValue = value; // 更新选中的值
      }
    });

    EventBus.$on('GoingtoChangeRadioOptions', ({ id, options }) => {
      if (id === this.id) {
        this.options = options; // 更新可选值列表
      }
    });

    EventBus.$on('GoingtoHideRadioComponent', ({ id, shouldBeVisible }) => {
      if (id === this.id) {
        this.visible = shouldBeVisible; // 更新组件的可见性
      }
    });

    EventBus.$on('GoingtoDisableRadioComponent', ({ id, disabled }) => {
      if (id === this.id) {
          this.handleDisable(disabled); // 调用handleDisable方法
      }
    });
    initDisabled(this);
    initVisible(this);
  },

  beforeDestroy() {
      EventBus.$off('GoingtoChangeRadioValue');
      EventBus.$off('GoingtoChangeRadioOptions');
      EventBus.$off('GoingtoHideRadioComponent');
      EventBus.$off('GoingtoDisableRadioComponent');
  },

  methods: {
    ...mapActions(['updateValue']), // 对应 Vuex actions 中的 updateValue

    updateValueEvent() {
      // 当选中值变化时，更新到Vuex中，并且发出ControlChanged事件
      this.updateValue({ id: this.id, value: this.selectedValue });
      EventBus.$emit('ControlChanged', { id: this.id, value: this.selectedValue });
    },
    initFromProperties() {
      // 根据传入的properties初始化组件的选项和选中值
      if (this.properties.options) {
        this.options = this.properties.options;
      }
      if (this.properties.initValue !== undefined) {
        this.selectedValue = this.properties.initValue;
      }
    },
    // 处理组件启用/禁用状态的变化
    handleDisable(isDisabled) {
        this.disabled = isDisabled; // 更新disabled属性
    },
  }
};
</script>
