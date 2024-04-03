<template>
  <div v-if="visible">
    <el-input
      :type="properties.type"
      :maxlength="properties.maxlength"
      :minlength="properties.minlength"
      :show-word-limit="properties.showWordLimit"
      :placeholder="properties.placeholder"
      :clearable="properties.clearable"
      :disabled="disabled"
      :size="properties.size"
      :prefix-icon="properties.prefixIcon"
      :suffix-icon="properties.suffixIcon"
      :rows="properties.rows"
      :autosize="properties.autosize"
      :name="properties.name"
      :readonly="properties.readonly"
      :resize="properties.resize"
      v-model="value"
      @input="updateValueEvent">
    </el-input>
  </div>
</template>

<script>
import { EventBus } from '../eventBus.js';
import { requestAjax } from '../util';

export default {
  props: [
    'id', 
    'properties'
    // properties 对象包含所有配置属性，每个属性的意义如下：
      // initValue：表示输入框的初始值
      // initVisible：表示输入框初始的显示状态，boolean类型，true表示显示，false表示隐藏。不设置则默认为显示。
      // initDisabled：表示输入框初始的是否disabled状态，boolean类型，true表示disabled，false表示enabled。不设置则默认为enabled。
      // type: 类型，当前支持text，textarea 和其他 原生 input 的 type 值
      // maxlength: 最大输入长度
      // minlength: 最小输入长度
      // showWordLimit: 是否显示字数限制
      // placeholder: 输入框占位文本
      // clearable: 是否可清空
      // disabled: 是否禁用
      // size: 输入框尺寸，可选值为medium/small/mini
      // prefixIcon: 输入框头部图标
      // suffixIcon: 输入框尾部图标
      // rows: 输入框行数，只对 type="textarea" 有效
      // autosize: 自适应内容高度，只对 type="textarea" 有效
      // name: 原生属性
      // readonly: 是否只读
      // resize: 控制是否能被用户缩放
  ],
  data() {
    return {
      value: '',
      visible: true,
      disabled: false,
    };
  },
  created() {
    EventBus.$on('GoingtoChangeEleInputValue', ({ id, value }) => {
      if (id === this.id) {
        this.handleValueChange(value);
      }
    });
    EventBus.$on('GoingtoHideInputComponent', ({ id, shouldBeVisible }) => {
      if (id === this.id) {
        this.toggleVisibility(shouldBeVisible);
      }
    });
    EventBus.$on('GoingtoDisableEleInputComponent', ({ id, disabled }) => {
      if (id === this.id) {
        this.handleDisable(disabled);
      }
    });
    EventBus.$on('GoingtoChangeEleInputValueByAjax', (payload) => {
      if (payload.id === this.id) {
        this.handleValueChangeByAjax(payload);
      }
    });
  },
  beforeDestroy() {
    EventBus.$off('GoingtoChangeEleInputValue');
    EventBus.$off('GoingtoHideEleInputComponent');
    EventBus.$off('GoingtoDisableEleInputComponent');
    EventBus.$off('GoingtoChangeEleInputValueByAjax');
  },
  methods: {
    updateValueEvent(value) {
      this.value = value;
      EventBus.$emit('ControlChanged', { id: this.id, value: this.value });
    },
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
