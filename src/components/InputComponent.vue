  <template>
    <div v-if="visible">
      <input type="text" v-model="value" @input="updateValueEvent" />
    </div>
  </template>

  <script>
  import { mapGetters, mapActions } from 'vuex';
  import { EventBus } from '../eventBus.js';
  import {initDisabled,initVisible} from '../util';
  export default {
    props: ['id','properties'],
    data(){
      return {
        visible: true,
        disabled: false, // 添加disabled属性，默认为false，表示组件未被禁用
      }
    },
    computed: {
    ...mapGetters([
      'getValue'   //从vuex中获取用户已从表单中填写的值
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
            this.updateValue({ id: this.id, value:newvalue });
            // console.log(`Input ControlChanged:${this.getValue(this.id)}---${newvalue}`);
            EventBus.$emit('ControlChanged',  { id: this.id, value: newvalue });
          }
        }
      }
    },
    created() {
      // 当组件创建时，确保从 Vuex 中获取已存储的值
      if (this.getValue(this.id)) {
        this.value = this.getValue(this.id);
      }else{
        this.initValueFromProperties();
      }
      this.visible = true;
      EventBus.$on('GoingtoChangeInputValue', ({ id, value }) => {
        if (id === this.id) {
          this.handleValueChange(value);
        }
      });
      // 入参结构: { id,shouldBeVisible  }
      EventBus.$on('GoingtoHideInputComponent', ({ id,shouldBeVisible  }) => {
        if (id === this.id) {
          this.toggleVisibility(shouldBeVisible);
        }
      });

      EventBus.$on('GoingtoChangeInputValueByAjax', (payload) => {
        if (payload.id === this.id) {
          this.handleValueChangeByAjax(payload);
        }
      });

      // 监听GoingtoDisableInputComponent事件
      EventBus.$on('GoingtoDisableInputComponent', ({id,disabled}) => {
        if (id === this.id) {
          this.handleDisable(disabled); // 调用handleDisable方法
        }
      });

      initDisabled(this);
      initVisible(this);
      // if('initVisible' in this.properties 
      //   && this.properties.initVisible!=undefined 
      //   && this.properties.initVisible!=null 
      //   && (typeof this.properties.initVisible)=='boolean'){
      //   this.visible = this.properties.initVisible;
      // }

      // if('initDisabled' in this.properties 
      //   && this.properties.initDisabled!=undefined 
      //   && this.properties.initDisabled!=null 
      //   && (typeof this.properties.initDisabled)=='boolean'){
      //   this.disabled = this.properties.initDisabled;
      // }

      //初始化时候，可能会有初始化数据，而初始化数据可能会影响到其他组件，所以需要在初始化结束时候发出事件（例如用户地址选择场景，用户可能省份选中了“广东”，那么如果本场景，则需要发出省份下拉列表选中广东，进而影响城市列表，列出广东的城市）
      this.emitInitValue();
      
    },
    beforeDestroy() {
      EventBus.$off('GoingtoChangeInputValue');
      EventBus.$off('GoingtoHideInputComponent');
      EventBus.$off('GoingtoDisableInputComponent');
      EventBus.$off('GoingtoChangeInputValueByAjax');
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
        this.value = (initValue!==undefined && initValue!==null)?initValue:'';//如果配置中有定义初始值，则把值设置到this.value中
      },

      //调用本方法，可触发组件的值变更。
      //当本组件监听到'GoingtoChangeInputValue' event时调用本方法
      handleValueChange(newValue) {
        this.value = newValue;
      },
      //调用本方法，可触发本组件的显示/隐藏变更。
      //当本组件监听到'GoingtoHideInputComponent' event时调用本方法
      toggleVisibility(shouldBeVisible) {
        this.visible = shouldBeVisible;
      },
      // 在methods对象中
      async handleValueChangeByAjax({ url, method, params }) {
        const response = await requestAjax({ url, method, params });
        if (response) {
          this.value = response.data.value; // 使用响应更新组件的值
        }
      },

      // 处理组件启用/禁用状态的变化
      handleDisable(isDisabled) {
        this.disabled = isDisabled; // 更新disabled属性
      },

      emitInitValue(){
        //初始化时候，可能会有初始化数据，而初始化数据可能会影响到其他组件，所以需要在初始化结束时候发出事件（例如用户地址选择场景，用户可能省份选中了“广东”，那么如果本场景，则需要发出省份下拉列表选中广东，进而影响城市列表，列出广东的城市）
        EventBus.$emit('ControlChanged',  { id: this.id, value: this.getValue(this.id) || '' });
      },
    }
  }
  </script>
