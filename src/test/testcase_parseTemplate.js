import {parseTemplate,processConfig} from '../util'
// 定义一个上下文类，这里用来模拟你的环境变量和请求入参等
const context = {
  env: {
    HOST: "example.com"
  },
  formFields: {
    provinceSelect: "Jiangsu",
    visible: 'hide', // 这个值用于三元表达式的判断
    visibilityToggle: '显示',
  },
  requestQuery: {
    customer_id: "12345"
  },
  getValue: function(key) {
    return this.formFields[key];
  },
  $route: {
    query: {
      get: function(key) {
        return context.requestQuery[key];
      }
    }
  }
};

// 使用示例
const testcase_group_1 = ()=>{
  const value1 = "http://{{environment:HOST}}/location";
  const value2 = "http://xxx/location={{formField:provinceSelect}}";
  const value3 = "{{parametersFromRequest:customer_id}}";
  const value4 = "http://{{environment:HOST}}/location?customer_id={{parametersFromRequest:customer_id}}";
  const value5 = {
    "nextConfigs": [{
      "condition": {
        "skipCondition": "true"
      },
      "actionList": [{
        "event": "GoingtoHideContainer",
        "payload": {
          "id": "citySelectionContainer",
          "shouldBeVisible": {
            "method": "condition",
            "condition": "equals",
            "key": "{{formField:visibilityToggle}}",
            "value": "显示"
          }
        }
      }]
    }]
  };
  // const value6 = "http://{{environment:HOST}}/location?customer_id={{parametersFromRequest:customer_id}}&visible={{formField:visible == 'hide' ? 'true' : 'false'}}";


  console.log(`value1:${parseTemplate(context,value1)}`); // 期望：http://example.com/location
  console.log(`value2:${parseTemplate(context,value2)}`); // 期望：http://xxx/location=Jiangsu
  console.log(`value3:${parseTemplate(context,value3)}`); // 期望：12345
  console.log(`value4:${parseTemplate(context,value4)}`); // 期望：http://example.com/location?customer_id=12345
  console.log(`value5:${JSON.stringify(processConfig(context,value5))}`); 
  /**
   * 期望：
   * {
      "nextConfigs": [{
        "condition": {
          "skipCondition": "true"
        },
        "actionList": [{
          "event": "GoingtoHideContainer",
          "payload": {
            "id": "citySelectionContainer",
            "shouldBeVisible": true
          }
        }]
      }]
    }
   **/


  // console.log(`value6:${parseTemplate(context,value6)}`); // 期望：http://example.com/location?customer_id=12345&visible=true

}
export {testcase_group_1};
