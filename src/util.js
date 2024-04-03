import axios from 'axios'; 
import {appConfig} from './config';

const requestAjax=async ({url, method = 'GET', params, headers={}}) => {
  const axiosConfig = {
    method: method.toLowerCase(),
    url,
  };
  if (method.toLowerCase() === 'post') {
    axiosConfig.data = params;
  } else if (method.toLowerCase() === 'get') {
    axiosConfig.params = params;
  } else {
    console.error('Unsupported HTTP method, only GET and POST are allowed.');
    return;
  }
  try {
    const response = await axios.request(axiosConfig);
    return response; 
  } catch (error) {
    console.error('Error fetching options via Ajax:', error);
  } finally {

  }
}

const parseTemplate = (context,template) => {

    // 现在的策略函数需要接收一个额外的context参数
  const strategies = {
    environment: function(context,key) {
      return appConfig[key] || context.env[key];
    },
    formField: function(context,key) {
      return context.getValue(key);
    },
    parametersFromRequest: function(context,key) {
      return context.$route.query[key];
    }
  };

  // 首先处理三元表达式
  template = template.replace(/\{\{([^{}]+)\}\}/g, (match, expression) => {
    try {
      // 使用new Function动态执行表达式
      let func = new Function("context", `with(context){return ${expression}}`);
      return func(context);
    } catch (e) {
      // console.error("Error evaluating expression:", expression, e);
      return match; // 如果有错，返回原始表达式
    }
  });

  // 然后处理其他类型的模板变量
  return template.replace(/\{\{(\w+):(\w+)\}\}/g, (match, p1, p2) => {
    if (strategies[p1]) {
      return strategies[p1](context,p2);
    }
    return match; // 如果没有匹配的策略，返回原始字符串
  });
}

const processObject = (context, obj) => {
  const processCondition = (condition) => {
    // 目前仅实现了equals对比方式，可以根据需求扩展
    if (condition.method === "condition"){
      if(condition.condition === "equals") {
        return parseTemplate(context, condition.key) === condition.value;
      }
    }
    return false; // 如果没有匹配的条件，返回false
  }

  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (typeof value === 'string') {
      // 处理字符串类型的属性
      obj[key] = parseTemplate(context, value);
    } else if (typeof value === 'object' && value !== null) {
      // 如果是对象并且有特殊的method处理
      if (value.method === 'condition') {
        // 使用processCondition来处理条件判断逻辑
        obj[key] = processCondition(value);
      } else {
        // 如果不是特殊处理的对象，递归处理该对象
        processObject(context, value);
      }
    }
  });
}

const processConfig = (context,config) => {
  if (Array.isArray(config)) {
    config.forEach(item => processObject(context,item));
  } else {
    processObject(context,config);
  }
  return config;
}

const inCompare=(var1, var2)=>{
    // 直接比较字符串或数字
    if ((typeof var1 === 'string' && typeof var2 === 'string') || 
        (typeof var1 === 'number' && typeof var2 === 'number')) {
      return var1 === var2;
    }

    // 处理两个数组的情况
    if (Array.isArray(var1) && Array.isArray(var2)) {
      return var1.some(element => var2.includes(element));
    }

    // 处理var1是数组，var2是字符串或数字的情况
    if (Array.isArray(var1) && (typeof var2 === 'string' || typeof var2 === 'number')) {
      return var1.includes(var2);
    }

    // 处理var2是数组，var1是字符串或数字的情况
    if ((typeof var1 === 'string' || typeof var1 === 'number') && Array.isArray(var2)) {
      return var2.includes(var1);
    }

    console.log("类型不兼容。");
    return false;
}

/**
 * 为组件设置初始显示/隐藏状态（依据context.properties.initVisible设置context.visible）
 * context为vue组件实例中的this
 * context.properties.initVisible为组件的入参（props）
 * context.visible是组件data变量之一
 * @param {*} context 
 */
const initVisible=(context)=>{
  if((typeof context.properties=='object') && 'initVisible' in context.properties 
        && context.properties.initVisible!=undefined 
        && context.properties.initVisible!=null 
        && (typeof context.properties.initVisible)=='boolean'){
          context.visible = context.properties.initVisible;
  }
}

/**
 * 为组件设置初始enabled/disabled状态（依据context.properties.initDisabled设置context.disabled）
 * context为vue组件实例中的this
 * context.properties.initDisabled为组件的入参（props）
 * context.disabled是组件data变量之一
 * @param {*} context 
 */
const initDisabled=(context)=>{
  if('initDisabled' in context.properties 
        && context.properties.initDisabled!=undefined 
        && context.properties.initDisabled!=null 
        && (typeof context.properties.initDisabled)=='boolean'){
          context.disabled = context.properties.initDisabled;
      }
}

// const convertVariable = (context,payload_in_json) => {
//   const operationHandlers = {
//     condition_equals(context, conditionObj) {
//       console.log(`context.getValue(conditionObj.key):${context.getValue(conditionObj.key)}`);
//       console.log(`conditionObj.value):${conditionObj.value}`);
//       return context.getValue(conditionObj.key) === conditionObj.value;
//     },
//     // 添加新的逻辑操作处理函数时，只需在这里扩展
//   }; 
//   const recursiveConversion = (obj) => {
//     for(let key in obj){
//       if (obj[key] && typeof obj[key] === 'object' && obj[key].method === 'formField') {
//         // const codeToRun = obj[key].slice(2, -1); // 提取引用的ID
//         // obj[key] = eval(codeToRun);
//         obj[key] = context.getValue(obj[key].key);
//       }else if (obj[key] && typeof obj[key] === 'object' && obj[key].method === 'condition') {
//         // obj[key] = context.getValue(obj[key].key);
//         const conditionObj = obj[key];
//         const methodToRunInOperationHandlers = `condition_${conditionObj.condition}`;
//         const handler = operationHandlers[methodToRunInOperationHandlers];
//         if (handler) {
//           obj[key] = handler(context, conditionObj);
//           console.log(`obj[key]:${obj[key]}`);
//         } else {
//           console.warn(`No handler for condition: ${conditionObj.condition}`);
//         }
//       }else if (obj[key] && typeof obj[key] === 'object' && obj[key].method === 'parametersFromRequest') {
//         // "customer_id":"${this.$route.query.customer_id}"
//         obj[key] = context.$route.query[obj[key].key];
//       }else if(typeof obj[key] === 'object'){
//         obj[key] = recursiveConversion(obj[key]);
//       }else if (obj[key] && typeof obj[key] === 'object' && obj[key].method === 'environment') {
//         // const variables = obj[key].variables;
//         // const value = obj[key].value;
        
//         // "value":"http://{{host}}/location"
//         // obj[key] = context.$route.query[obj[key].key];
//       }
//     }
//     console.log(`obj:${JSON.stringify(obj)}`);
//     return obj;
//   };
//   return recursiveConversion(payload_in_json);
// }

export {requestAjax, parseTemplate, processConfig,inCompare,
  initVisible,initDisabled};