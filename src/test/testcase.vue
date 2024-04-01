<template>
  <div id="app" :key="refresh">
    <!-- {{ apiUrl }}<button @click="testEnv">check</button> -->
    <ContainerComponent id="root" :componentConfigsFromProps="componentConfigs"/>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import ContainerComponent from '../components/ContainerComponent.vue';
import { EventBus } from '../eventBus.js';
import { requestAjax,processConfig } from '../util';
import lodash from 'lodash';
export default {
  components: {
    ContainerComponent,
  },
  data() {
    return {
      // apiUrl: process.env.API_URL,
      componentConfigs: [],
      nextConfigs: [],
      initAppConfig: {},
      config: {},
      refresh: 1,
    }
  },
  computed: {
    ...mapGetters([
      'getValue'
    ]),
  },
  created(){
    //所有组件变动的时候（例如用户在InputComponent组件中输入内容；用户在SelectComponent组件中选择内容时候等等）都会触发ControlChanged事件，上报它们最新的值
    //侦听到ControlChanged事件后，触发this.handleControlChanged方法。
    EventBus.$on('ControlChanged', this.handleControlChanged);
  },
  async mounted(){
    await this.loadConfig();
    await this.initApp();
    this.refresh = 2;
  },
  beforeDestroy() {
    EventBus.$off('ControlChanged', this.handleControlChanged);
  },
  methods: {
    ...mapActions([
        'updateValue' // 对应 Vuex actions 中的 updateValue
    ]),
    // 处理选择变化事件
    handleControlChanged({ id, value }) {
        // 根据当前表单值和配置评估条件，执行相应动作
        this.next(this.nextConfigs);
    },

    evaluateCondition(condition) {
      if("skipCondition" in condition && condition["skipCondition"]){
          return true;
      }else{
        if (condition.id) {
              if(condition.operation === 'any'){
                //operation是any的情况下，直接返回true
                return true;
              }else if(condition.operation === 'equals'){
                return this.getValue(condition.id) && this.getValue(condition.id) === condition.value;
              }else if(condition.operation === 'in'){
                return this.getValue(condition.id) && this.getValue(condition.id).includes(condition.value);
              }else if(condition.operation === 'not in'){
                return !(this.getValue(condition.id) && this.getValue(condition.id).includes(condition.value));
              }else{
                return false;
              }
        } else if (condition.type === 'and') {
            // 处理AND条件，需要所有子条件都满足
            return condition.conditions.every(cond => this.evaluateCondition(cond));
        } else if (condition.type === 'or') {
            // 处理OR条件，至少一个子条件满足
            return condition.conditions.some(cond => this.evaluateCondition(cond));
        } else if (!('type' in condition) && condition.conditions.length===1) {
            // 如果没有type类型，且只有一个条件的情况下
            return this.evaluateCondition(condition.conditions[0]);
        }
      }
      // Invalid condition
      return false;
    },
    next(config) {
      // 遍历配置，评估每个条件块 
      config.forEach(conditionBlock => {
          if (this.evaluateCondition(conditionBlock.condition)) {
              setTimeout(()=>{
                // 如果条件满足，执行动作列表中的动作
                conditionBlock.actionList.forEach(action => {
                    const payload = { ...action.payload };
                    let convert_payload = lodash.cloneDeep(payload); // 使用深拷贝，不然下面一句会将action.payload对象改变。
                    
                    convert_payload = processConfig(this, convert_payload);
                    // convert_payload = convertVariable(this,convert_payload);
                    // 通过EventBus发射事件
                    console.log(` ${action.event}---${JSON.stringify(convert_payload)}`);
                    EventBus.$emit(action.event, convert_payload);
                });
            },10);
          }
      });
    },

    async loadConfig() {
      // 获取 URL 查询参数
      const caseno = this.$route.query.caseno;
      if (caseno) {
        // 动态导入 JSON 文件
        try{
            const module = await import(`./${caseno}.json`)
            // 将导入的 JSON 赋值给 config
            this.config = module.default;
            this.componentConfigs = this.config['componentConfigs'];
            this.nextConfigs = this.config['nextConfigs'];
            this.initAppConfig = this.config['initAppConfig'];
            
        }catch(error){
            console.error("Failed to load the json file", error);
            // 处理错误（例如，文件不存在时）
            this.config = { error: 'Failed to load config' };
        };
      }
    },

    async initApp(){
      if (this.initAppConfig && 'url' in this.initAppConfig){
        const url = this.initAppConfig['url'];
        const method = 'method' in this.initAppConfig && this.initAppConfig['method'] && this.initAppConfig['method']!=''?this.initAppConfig['method']:undefined;
        const params = 'params' in this.initAppConfig && this.initAppConfig['params'] ?this.initAppConfig['params']:undefined;
        const params_convert = processConfig(this,params);
        // const params_convert = convertVariable(this,params);
        const response = await requestAjax({url, method, params:params_convert}); 
        if(response){
          if(response.data){
            for(const id in response.data){
              this.updateValue({ id: id, value: response.data[id] });
            }
          }
        }
      }
    },
  },
  watch: {
    // 监听 $route 对象，当路由变化时执行操作
    '$route'(to, from) {
      this.loadConfig();
    }
  },
}
</script>
