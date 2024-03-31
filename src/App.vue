<!-- <template>
  <div id="app">
    <SelectComponent :options="options" id="select1" @ControlChanged="handleControlChanged" />
    <InputComponent id="input1" />
    <SelectComponent :options="options" id="select2" @ControlChanged="handleControlChanged" />
    <InputComponent id="input2" />
    <SelectComponent :options="options" id="select3" @ControlChanged="handleControlChanged" />
    <InputComponent id="input3" />
  </div>
</template> -->

<template>
  <div id="app">
    <component
      v-for="componentConfig in componentConfigs"
      :key="componentConfig.id"
      :is="componentConfig.type"
      :id="componentConfig.id"
      :properties="componentConfig.properties"
    />
  </div>
</template>

<script>
import SelectComponent from './components/SelectComponent.vue';
import InputComponent from './components/InputComponent.vue';
import { EventBus } from './eventBus.js';
const componentConfigs = [
  {
    "type": "SelectComponent",
    "id": "select1",
    "properties":{
      "options": [
          { value: 'a', label: 'A' },
          { value: 'b', label: 'B' },
          { value: 'c', label: 'C' },
        ],
        "initValue":"b",
      "event": "ControlChanged"
    }
  },
  {
    "type": "InputComponent",
    "id": "input1",
    "payload":{}
  },
  {
    "type": "SelectComponent",
    "id": "select2",
    "properties":{
      "options": [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
        { value: 'c', label: 'C' },
      ],
      "event": "ControlChanged"
    }
  },
  {
    "type": "InputComponent",
    "id": "input2"
  },
  {
    "type": "SelectComponent",
    "id": "select3",
    "properties":{
      "options": [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
        { value: 'c', label: 'C' },
      ],
      "event": "ControlChanged"
    }
  },
  {
    "type": "InputComponent",
    "id": "input3",
    "properties":{}
  }
];

const nextConfig = [
    // 配置1: 当select1为a且(select2为b或select3为c)时，隐藏input1
    {
        "condition": {
            "type": "and",
            "conditions": [
                {
                    "id": "select1",
                    "operation": "equals",
                    "value": "a"
                },
                {
                    "type": "or",
                    "conditions": [
                        {
                            "id": "select2",
                            "operation": "equals",
                            "value": "b"
                        },
                        {
                            "id": "select3",
                            "operation": "equals",
                            "value": "c"
                        }
                    ]
                }
            ]
        },
        "actionList": [
            {
                "event": "GoingtoHideInputText",
                "payload": {
                    "id": "input1",
                    "shouldBeVisible": false
                }
            }
        ]
    },
    // 配置2: 当select3为c时，隐藏input3显示c
    {
        "condition": {
          "skipCondition":true
        },
        "actionList": [
            {
                "event": "GoingtoChangeInputText",
                "payload": {
                    "id": "input3",
                    "value": "${select3}"
                }
            }
        ]
    }
]

function evaluateCondition(condition, valuesInForm) {
    if("skipCondition" in condition && condition["skipCondition"]){
        return true;
    }else{
        if (condition.id) {
            return valuesInForm[condition.id] === condition.value;
        } else if (condition.type === 'and') {
            // 处理AND条件，需要所有子条件都满足
            return condition.conditions.every(cond => evaluateCondition(cond, valuesInForm));
        } else if (condition.type === 'or') {
            // 处理OR条件，至少一个子条件满足
            return condition.conditions.some(cond => evaluateCondition(cond, valuesInForm));
        }
    }
    // Invalid condition
    return false;
}

function next(config, valuesInForm) {
    // 遍历配置，评估每个条件块
    config.forEach(conditionBlock => {
        if (evaluateCondition(conditionBlock.condition, valuesInForm)) {
            // 如果条件满足，执行动作列表中的动作
            conditionBlock.actionList.forEach(action => {
                const payload = { ...action.payload };
                // 解析payload中的特殊标记
                if (typeof payload.value === 'string' && payload.value.startsWith('${') && payload.value.endsWith('}')) {
                    const refId = payload.value.slice(2, -1); // 提取引用的ID
                    // console.log(`refId:${refId}--valuesInForm[refId]：${valuesInForm[refId]}`);
                    payload.value = valuesInForm[refId]; // 用实际的值替换
                }
                // 通过EventBus发射事件
                EventBus.$emit(action.event, payload);
            });
        }
    });
}

export default {
  components: {
    SelectComponent,
    InputComponent
  },
  data() {
    return {
      options: [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
        { value: 'c', label: 'C' },
      ],
      // 存储表单中各控件的值
      valuesInForm:{},
      componentConfigs: componentConfigs,
    }
  },
  created(){
    EventBus.$on('ControlChanged', this.handleControlChanged);
  },
  beforeDestroy() {
    EventBus.$off('ControlChanged', this.handleControlChanged);
  },
  methods: {
    // 处理选择变化事件
    handleControlChanged({ id, value }) {
      // 更新存储的控件值
      this.valuesInForm[id] = value;
      // 根据当前表单值和配置评估条件，执行相应动作
      next(nextConfig,this.valuesInForm);
    }
  }
}
</script>
