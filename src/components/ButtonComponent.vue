<template>
  <button @click="submit">{{ buttonText }}</button>
</template>

<script>
import { mapGetters } from 'vuex';
import { requestAjax,convertVariable } from '../util';
export default {
  data(){
    return {
      buttonText:'',
      url:'',
      method:'post',
      params:{},
    }
  },
  
  props:['id','properties'],

  computed: {
    ...mapGetters([
      'getValue'
    ])
  },

  created(){
    if(this.properties){
      this.buttonText = this.properties?.buttonText ? this.properties?.buttonText : '';
      this.url = this.properties?.url ? this.properties?.url : '';
      this.method = this.properties?.method ? this.properties?.method : 'post';
      this.params = this.properties?.params ? this.properties?.params : {};
    }
  },
  methods:{
    async submit(){
      let requestParams = {
        'url':this.url,
        'method':this.method,
        'params':this.params
      };
      requestParams = convertVariable(this,requestParams);
      const response = await requestAjax(requestParams);
      if(response){
        if(response.data){
          console.log(`submit success`);
        } 
      }
    }
  }
}
</script>

<style>

</style>