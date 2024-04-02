<template>
  <div id="app">
    <ContainerComponent id="root" :componentConfigsFromProps="componentConfigs"/>
  </div>
</template>

<script>
import ContainerComponent from './components/ContainerComponent.vue';
import { EventBus } from './eventBus.js';


const componentConfigs = [{
		"type": "SelectComponent",
		"id": "select0",
		"properties": {
			"options": [{
					"value": "false",
					"label": "Show"
				},
				{
					"value": "true",
					"label": "Hide"
				}
			],
			"initValue": "false"
		},
		"event": "ControlChanged"
	},
	{
		"type": "ContainerComponent",
		"id": "container1",
		"properties": {
			"componentConfigs": [{
					"type": "SelectComponent",
					"id": "select1",
					"properties": {
						"options": [{
								"value": "showSelectComponent",
								"label": "Show SelectComponent"
							},
							{
								"value": "hideSelectComponent",
								"label": "Hide SelectComponent"
							}
						],
						"initValue": "showSelectComponent"
					},
					"event": "ControlChanged"
				},
				{
					"type": "InputComponent",
					"id": "input1"
				},
				{
					"type": "SelectComponent",
					"id": "select2",
					"properties": {
						"options": [{
								"value": "a",
								"label": "A"
							},
							{
								"value": "b",
								"label": "B"
							},
							{
								"value": "c",
								"label": "C"
							}
						]
					},
					"event": "ControlChanged"
				},
				{
					"type": "InputComponent",
					"id": "input2"
				},
				{
					"type": "SelectComponent",
					"id": "select3",
					"properties": {
						"options": [{
								"value": "a",
								"label": "A"
							},
							{
								"value": "b",
								"label": "B"
							},
							{
								"value": "c",
								"label": "C"
							}
						]
					},
					"event": "ControlChanged"
				},
				{
					"type": "InputComponent",
					"id": "input3",
					"properties": {}
				}
			]
		}
	}
];

const nextConfig = [
    
    // 配置1: 当select1为a且(select2为b或select3为c)时，隐藏input1
    {
        "condition": {
            "type": "and",
            "conditions": [
                {
                    "id": "select0",
                    "operation": "equals",
                    "value": "true"
                }
            ]
        },
        "actionList": [
            {
                "event": "GoingtoHideContainer",
                "payload": {
                    "id": "container1",
                    "shouldBeVisible": false
                }
            }
        ]
    },
    // 配置2: 当select3为c时，隐藏input3显示c
    {
        "condition": {
            "type": "and",
            "conditions": [
                {
                    "id": "select0",
                    "operation": "equals",
                    "value": "false"
                }
            ]
        },
        "actionList": [
            {
                "event": "GoingtoHideContainer",
                "payload": {
                    "id": "container1",
                    "shouldBeVisible": true
                }
            }
        ]
    },

    {
        "condition": {
            "type": "and",
            "conditions": [
                {
                    "id": "select1",
                    "operation": "equals",
                    "value": "hideSelectComponent"
                }
            ]
        },
        "actionList": [
            {
                "event": "GoingtoHideSelectComponent",
                "payload": {
                    "id": "select2",
                    "shouldBeVisible": false
                }
            }
        ]
    },

    {
        "condition": {
            "type": "and",
            "conditions": [
                {
                    "id": "select1",
                    "operation": "equals",
                    "value": "showSelectComponent"
                }
            ]
        },
        "actionList": [
            {
                "event": "GoingtoHideSelectComponent",
                "payload": {
                    "id": "select2",
                    "shouldBeVisible": true
                }
            }
        ]
    },


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
                "event": "GoingtoHideInputComponent",
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
                "event": "GoingtoChangeInputValue",
                "payload": {
                    "id": "input3",
                    "value": "${this.getValue('select3')}"
                }
            }
        ]
    }
];


import { mapGetters } from 'vuex';
export default {
  components: {
    ContainerComponent,
  },
  data() {
    return {
      selectProperties:{
        options: [
          { value: 'false', label: 'Show' },
          { value: 'true', label: 'Hide' }
        ],
        "initValue":"false",
      },
      componentConfigs: componentConfigs,
      nextConfig: nextConfig,
    }
  },
  computed: {
    ...mapGetters([
      'getValue'
    ])
  },
  created(){
    //所有组件变动的时候（例如用户在InputComponent组件中输入内容；用户在SelectComponent组件中选择内容时候等等）都会触发ControlChanged事件，上报它们最新的值
    //侦听到ControlChanged事件后，触发this.handleControlChanged方法。
    EventBus.$on('ControlChanged', this.handleControlChanged);
  },
  beforeDestroy() {
    EventBus.$off('ControlChanged', this.handleControlChanged);
  },
  methods: {
    // 处理选择变化事件
    handleControlChanged({ id, value }) {
        // 根据当前表单值和配置评估条件，执行相应动作
        this.next(this.nextConfig);
    },

    evaluateCondition(condition) {
      if("skipCondition" in condition && condition["skipCondition"]){
          return true;
      }else{
          if (condition.id) {
              return this.getValue(condition.id) && this.getValue(condition.id) === condition.value;
          } else if (condition.type === 'and') {
              // 处理AND条件，需要所有子条件都满足
              return condition.conditions.every(cond => this.evaluateCondition(cond));
          } else if (condition.type === 'or') {
              // 处理OR条件，至少一个子条件满足
              return condition.conditions.some(cond => this.evaluateCondition(cond));
          }
      }
      // Invalid condition
      return false;
    },
    next(config) {
      // 遍历配置，评估每个条件块
      // console.log(`config:${JSON.stringify(config)}`);
      config.forEach(conditionBlock => {
          if (this.evaluateCondition(conditionBlock.condition)) {
              // 如果条件满足，执行动作列表中的动作
              conditionBlock.actionList.forEach(action => {
                  const payload = { ...action.payload };
                  // 解析payload中的特殊标记
                  if (typeof payload.value === 'string' && payload.value.startsWith('${') && payload.value.endsWith('}')) {
                      const refId = payload.value.slice(2, -1); // 提取引用的ID
                      payload.value = this.getValue(refId); // 用实际的值替换
                    }
                  // 通过EventBus发射事件
                  console.log(`action.event:${action.event}---${JSON.stringify(payload)}`);
                  EventBus.$emit(action.event, payload);
              });
          }
      });
    }
  }
}
</script>
