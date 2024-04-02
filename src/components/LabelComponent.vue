  <template>
      <label v-if="visible">{{ labelText }}</label>
  </template>

  <script>
  import {initDisabled,initVisible} from '../util';
  export default {
    props: ['id','properties'],
    data(){
      return {
        visible: true,
        labelText: '',
        disabled: false, // 添加disabled属性，默认为false，表示组件未被禁用
      }
    },
    created() {
      this.initValueFromProperties();
      this.visible = true;
      initDisabled(this);
      initVisible(this);
    },
    methods: {
      //对本组件的值进行初始化（从传入的properties中初始化）
      initValueFromProperties(){
        const initLabelText = this.properties?.initLabelText;
        this.labelText = (initLabelText!==undefined && initLabelText!==null)?initLabelText:'';//如果配置中有定义初始值，则把值设置到this.value中
      },
    }
  }
  </script>
