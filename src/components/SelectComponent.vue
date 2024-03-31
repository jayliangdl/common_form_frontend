<template>
  <div v-if="visible">
    <select @change="updateValueEvent" v-model="value">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { EventBus } from '../eventBus.js';
import { requestAjax } from '../util';
export default {
  props: ['id', 'properties'],
  data(){
    return {
        'options':[],
        visible: true,
    }
  },
  computed: {
    ...mapGetters([
      'getValue'    //从vuex中获取用户已从表单中填写的值
    ]),
    value: {
        get() {
          //从vuex中获取用户已从表单中填写的值
          return this.getValue(this.id) || '';
        },
        set(newvalue) {
          const needUpdate = newvalue && this.getValue(this.id) !== newvalue;
          //当用户在组件中输入时，若发现新的值与vuex中保存的值不一样的时候，往vuex保存新的值，并向外发出'ControlChanged'的事件（'ControlChanged'事件会被最顶层引用组件的地方捕捉到，并做相应判断，检查是否达到某些条件，而触发其他交互变动）
          if (needUpdate) {
            this.updateValue({ id: this.id, value: newvalue });
            EventBus.$emit('ControlChanged',  { id: this.id, value: newvalue });
          }
        }
      }
    },
  destroyed(){
    EventBus.$off('GoingtoChangeSelectValue');
    EventBus.$off('GoingtoChangeSelectOptions');
    EventBus.$off('GoingtoHideSelectComponent');
    EventBus.$off('GoingtoChangeSelectOptionsByAjax');
  },
  created(){
    // 当组件创建时，确保从 Vuex 中获取已存储的值
    this.initControlFromProperties();
    if (this.getValue(this.id)) {
        this.value = this.getValue(this.id);
    }else{
        this.initValueFromProperties();
    }
    /**
     * 当接收到GoingtoChangeSelectValue事件时（表示要修改下拉菜单的值），通过调用this.handleValueChange方法处理
     * 事件报文{ id, value }。id表示组件实例ID，value表示更新后的值
     */
    EventBus.$on('GoingtoChangeSelectValue', ({ id, value }) => {
        if (id === this.id) {
          this.handleValueChange(value);
        }
    });
    /**
     * 当接收到GoingtoChangeSelectOptions事件时（表示要修改下拉菜单的选项列表），通过调用this.handleOptionsChange方法处理
     * 事件报文{ id, options }。id表示组件实例ID，options表示更新后的选项列表
     */
    EventBus.$on('GoingtoChangeSelectOptions', ({ id, options }) => {
        if (id === this.id) {
          this.handleOptionsChange(options);
        }
      });
    /**
     * 当接收到GoingtoHideSelectComponent事件时（表示要隐藏/显示组件），通过调用this.toggleVisibility方法处理
     * payload结构: { id,shouldBeVisible  }
     * shouldBeVisible=true表示显示，false表示隐藏
     */
    EventBus.$on('GoingtoHideSelectComponent', (payload) => {
      if (payload.id === this.id) {
        this.toggleVisibility(payload.shouldBeVisible);
      }
    });

    /**
     * 当接收到GoingtoChangeSelectOptionsByAjax事件时（表示要通过Ajax的方式，请求远端一个API，获取更新的选项列表，并更新到组件中），通过调用this.handleOptionsChangeByAjax方法处理
     * payload结构: { id, url, method, params }
     * id表示组件实例ID，url表示更新后的选项列表，method表示请求类型（get/post），params表示请求参数
     */
    EventBus.$on('GoingtoChangeSelectOptionsByAjax', (payload) => {
      if (payload.id === this.id) {
        this.handleOptionsChangeByAjax(payload);
      }
    });

    //初始化时候，可能会有初始化数据，而初始化数据可能会影响到其他组件，所以需要在初始化结束时候发出事件（例如用户地址选择场景，用户可能省份选中了“广东”，那么如果本场景，则需要发出省份下拉列表选中广东，进而影响城市列表，列出广东的城市）
    this.emitInitValue();
  },
  methods: {
    ...mapActions([
        'updateValue' // 对应 Vuex actions 中的 updateValue
    ]),
    //用户在<input>输入框在输入内容时，会触发updateValueEvent方法，更改this.value
    updateValueEvent(event) {
      this.value = event.target.value;  //它会触发value的set方法
    },
    //对本组件的值进行初始化（从传入的properties中初始化）
    initValueFromProperties(){
      const initValue = this.properties?.initValue;
      this.value = initValue?initValue:null;
    },
    //初始化本控件（从传入的properties中初始化，主要针对可选值options）
    initControlFromProperties(){
      this.options = this.properties?.options;
    },
    //调用本方法，可触发组件的值变更。
    //当本组件监听到'GoingtoChangeSelectValue' event时调用本方法
    handleValueChange(newValue) {
      this.value = newValue;
    },
    //调用本方法，可触发组件的Options值变更。
    //当本组件监听到'GoingtoChangeSelectOptions' event时调用本方法
    handleOptionsChange(newOptions) {
      this.options = newOptions;
    },
    //调用本方法，可触发本组件的显示/隐藏变更。
    //当本组件监听到'GoingtoHideSelectComponent' event时调用本方法
    toggleVisibility(shouldBeVisible) {
      this.visible = shouldBeVisible;
    },
    //调用本方法，可触发组件的Options值变更（通过请求Ajax执行进行options选项值的变更）。
    //当本组件监听到'GoingtoChangeSelectOptionsByAjax' event时调用本方法
    //url为调用ajax地址
    //method为post或get方法（忽略大小写）
    //params为参数，如果是post方法，则是一个json格式的body，如果是get方法，是一个带有所有参数的json，需要方法中转换成字符串
    async handleOptionsChangeByAjax({ url, method, params }) {
      const response = await requestAjax({url, method, params}); 
      if(response){
        const newOptions = response.data.options; // 假设服务器返回的数据结构中包含 options 数组
        this.options = newOptions;
        this.visible = true; // 如果选项更新后希望下拉框可见，则设置为 true，根据实际需求调整
      }
    },

    emitInitValue(){
      //初始化时候，可能会有初始化数据，而初始化数据可能会影响到其他组件，所以需要在初始化结束时候发出事件（例如用户地址选择场景，用户可能省份选中了“广东”，那么如果本场景，则需要发出省份下拉列表选中广东，进而影响城市列表，列出广东的城市）
       EventBus.$emit('ControlChanged',  { id: this.id, value: this.getValue(this.id) || '' });
    },
  }
}
</script>
