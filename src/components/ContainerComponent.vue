<template>
  <div v-if="visible">
    <component
      v-for="componentConfig in componentConfigs"
      :key="componentConfig.id"
      :is="componentConfig.type"
      :id="componentConfig.id"
      :properties="componentConfig.properties ? componentConfig.properties : undefined"
    />
  </div>
</template>

<script>
import { EventBus } from '../eventBus.js';

export default {
  props: ['id','componentConfigsFromProps', 'properties'],
  data() {
    return {
      visible: true,
      componentConfigs:null,
    }
  },

  beforeCreate() {
    this.$options.components.ContainerComponent = require('./ContainerComponent.vue').default;
    
    // if(this.componentConfigs && this.componentConfigs.length>0){
    //   const unioncomponentConfigs = Set(this.componentConfigs);
    //   for(const componentConfig of unioncomponentConfigs){
    //     const requirePath = `./${componentConfig.type}.vue`;
    //     console.log(requirePath);
    //     this.$options.components.ContainerComponent = require(requirePath).default;
    //   }
    // }
  },

  created() {
    if(this.componentConfigsFromProps){
      this.componentConfigs = this.componentConfigsFromProps;
    }else if('componentConfigs' in this.properties){
      this.componentConfigs = this.properties['componentConfigs'];
    }
    // 动态加载组件
    this.componentConfigs.forEach(config => {
      if (!this.$options.components[config.type]) {
        const name = config.type;
        this.$options.components[name] = () => import(`./${name}.vue`);
      }
    });
    this.visible = true;
    EventBus.$on('GoingtoHideContainer', (payload) => {
      if (payload.id === this.id) {
        this.toggleVisibility(payload.shouldBeVisible);
      }
    });
  },
  
  methods: {
    toggleVisibility(shouldBeVisible) {
      this.visible = shouldBeVisible;
    },
  }
}
</script>
