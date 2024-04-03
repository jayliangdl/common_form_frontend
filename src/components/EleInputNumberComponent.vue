<template>
  <div v-if="visible">
    <el-input-number
      v-model="value"
      :min="properties.min"
      :max="properties.max"
      :step="properties.step"
      :step-strictly="properties.stepStrictly"
      :precision="properties.precision"
      :size="properties.size"
      :disabled="disabled"
      :controls="properties.controls"
      :controls-position="properties.controlsPosition"
      :placeholder="properties.placeholder"
      :label="properties.label">
    </el-input-number>
  </div>
</template>

<script>
import { EventBus } from '../eventBus.js';
import { requestAjax } from '../util';

export default {
  props: [
    'id', 
    'properties'
      // properties 对象包含的属性说明如下：
        // min: 最小值
        // max: 最大值
        // step: 步长，指每次改变的间隔大小
        // stepStrictly: 是否只能输入步长的倍数，确保输入值总是步长的整数倍
        // precision: 数值精度，控制显示的小数位数
        // size: 计数器尺寸，可选值为 'large', 'default', 'small'
        // disabled: 是否禁用状态
        // controls: 是否显示控制按钮
        // controlsPosition: 控制按钮的位置，'right' 表示在右侧
        // placeholder: 输入框的占位符
        // label: 输入框前的标签文本
  ],
  data() {
    return {
      value: 0,
      visible: true,
      disabled: false,
    };
  },
  created() {
    EventBus.$on('GoingtoChangeEleInputNumberComponentValue', ({ id, value }) => {
      if (id === this.id) {
        this.handleValueChange(value);
      }
    });
    EventBus.$on('GoingtoHideEleInputNumberComponent', ({ id, shouldBeVisible }) => {
      if (id === this.id) {
        this.toggleVisibility(shouldBeVisible);
      }
    });
    EventBus.$on('GoingtoDisableEleInputNumberComponent', ({ id, disabled }) => {
      if (id === this.id) {
        this.handleDisable(disabled);
      }
    });
    EventBus.$on('GoingtoChangeEleInputNumberComponentValueByAjax', (payload) => {
      if (payload.id === this.id) {
        this.handleValueChangeByAjax(payload);
      }
    });
  },
  beforeDestroy() {
    EventBus.$off('GoingtoChangeEleInputNumberComponentValue');
    EventBus.$off('GoingtoHideEleInputNumberComponent');
    EventBus.$off('GoingtoDisableEleInputNumberComponent');
    EventBus.$off('GoingtoChangeEleInputNumberComponentValueByAjax');
  },
  methods: {
    handleValueChange(newValue) {
      this.value = newValue;
    },
    toggleVisibility(shouldBeVisible) {
      this.visible = shouldBeVisible;
    },
    async handleValueChangeByAjax({ url, method, params }) {
      const response = await requestAjax({ url, method, params });
      if (response) {
        this.value = response.data.value;
      }
    },
    handleDisable(isDisabled) {
      this.disabled = isDisabled;
    },
  },
};
</script>
