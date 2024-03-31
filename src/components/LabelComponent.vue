  <template>
      <label v-if="visible">{{ labelText }}</label>
  </template>

  <script>
  export default {
    props: ['id','properties'],
    data(){
      return {
        visible: true,
        labelText: ''
      }
    },
    created() {
      this.initValueFromProperties();
      this.visible = true;
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
