<template>
  <div v-if="visible">
    <el-select
      v-model="value"
      :multiple="properties.multiple"
      :disabled="properties.disabled"
      :size="properties.size"
      :clearable="properties.clearable"
      :multiple-limit="properties.multipleLimit"
      :name="properties.name"
      :placeholder="properties.placeholder"
      :filterable="properties.filterable"
      :remote="properties.remote"
      :loading-text="properties.loadingText"
      :no-match-text="properties.noMatchText"
      :no-data-text="properties.noDataText"
      :remote-method="remoteMethod"
      @change="handleChange">
      <el-option
        v-for="option in properties.options"
        :key="option.key"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled">
      </el-option>
    </el-select>
  </div>
</template>

<script>
import { EventBus } from '../eventBus.js';
import { requestAjax, processConfig as processParams } from '../util';
export default {
  props: [
    'id', 
    'properties',
    /**
     * properties 对象包含所有配置属性，每个属性的意义如下：
          multiple: 是否支持多选。
          disabled: 是否禁用选择器。
          size: 选择器大小，支持medium / small / mini。
          clearable: 是否可以清空选项。
          multiple-limit: 多选时用户最多可以选择的项目数，为 0 则不限制。
          name: 选择器的 name 属性。
          placeholder: 选择框默认文字。
          filterable: 是否可搜索，当其为true时，可以输入项进行搜索。
          remote: 是否为远程搜索。
          loading-text: 远程搜索中的加载提示文字。
          no-match-text: 搜索条件无匹配时显示的文字。
          no-data-text: 选项为空时显示的文字。
          options-remote-load：远程读取options列表，本对象包含以下属性：
            url: 请求ajax的地址
            method: 请求方法（目前支持"post" 或 "get"）
            params: 请求参数，如果是post方法，则是请求的body；如果是get，params是json，里边的key和value就是对应的条件和值
          options: 下拉选项数据，包含value、label、key、disabled字段。
    **/
      
  ],
  data() {
    return {
      value: this.properties.initValue || (this.properties.multiple ? [] : ''),
      visible: true, // 控制组件的显示状态，默认为true
      //对应this.remoteMethod(query)方法，用于定义远程API查询options列表。
      //如果properties.options-remote-load对象有定义，则this.remoteMethod会被定义成"remoteMethod"
      remoteMethod:undefined,
      remoteMethodSearchKeyword:'',//使用远程API查询options列表时在选择框中输入的关键字。定义远程获取options的API时params参数一定有“remoteMethodSearchKeyword”这个变量
    };
  },
  created() {
    if(this.options-remote-load && this.options-remote-load?.url){
      this.remoteMethod = this.queryOptionsMethod;
    }
    EventBus.$on('GoingtoChangeEleSelectComponentValue', (payload) => {
      if (payload.id === this.id) {
        this.value = payload.value;
      }
    });
    EventBus.$on('GoingtoHideEleSelectComponent', (payload) => {
      if (payload.id === this.id) {
        this.visible = payload.shouldBeVisible;
      }
    });
    EventBus.$on('GoingtoDisableEleSelectComponent', (payload) => {
      if (payload.id === this.id) {
        this.properties.disabled = payload.disabled;
      }
    });
    EventBus.$on('GoingtoChangeEleSelectComponentValueByAjax', async (payload) => {
      if (payload.id === this.id) {
        await this.handleValueChangeByAjax(payload);
      }
    });
  },
  beforeDestroy() {
    EventBus.$off('GoingtoChangeEleSelectComponentValue');
    EventBus.$off('GoingtoHideEleSelectComponent');
    EventBus.$off('GoingtoDisableEleSelectComponent');
    EventBus.$off('GoingtoChangeEleSelectComponentValueByAjax');
  },
  methods: {
    handleChange(value) {
      this.$emit('change', { id: this.id, value: value });
    },
    async handleValueChangeByAjax({ url, method, params }) {
      // Ajax call simulation
      const response = await this.$http({ url, method, params });
      if (response && response.data) {
        this.value = response.data.value;
      }
    },

    qsueryOptionsMethod(query) {
      if (query !== '') {
        this.loading = true;
        this.remoteMethodSearchKeyword = query;
        const convertParams = processParams(this, params);
        requestAjax({url, method, convertParams})
          .then(
            (response)=>{
              const newOptions = response.data.options; // 假设服务器返回的数据结构中包含 options 数组
              this.options = newOptions;
              this.loading = false;
            },
            (error)=>{
              console.log(error);
              this.loading = false;
              this.options = [];
            }
          )
      } else {
        this.options = [];
      }
    }
  },
};
</script>
