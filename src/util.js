import axios from 'axios'; 

const requestAjax=async ({url, method = 'GET', params}) => {
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

const convertVariable = (context,payload_in_json) => {
  const operationHandlers = {
    condition_equals(context, conditionObj) {
      console.log(`context.getValue(conditionObj.key):${context.getValue(conditionObj.key)}`);
      console.log(`conditionObj.value):${conditionObj.value}`);
      return context.getValue(conditionObj.key) === conditionObj.value;
    },
    // 添加新的逻辑操作处理函数时，只需在这里扩展
  }; 
  const recursiveConversion = (obj) => {
    for(let key in obj){
      if (obj[key] && typeof obj[key] === 'object' && obj[key].method === 'formField') {
        // const codeToRun = obj[key].slice(2, -1); // 提取引用的ID
        // obj[key] = eval(codeToRun);
        obj[key] = context.getValue(obj[key].key);
      }else if (obj[key] && typeof obj[key] === 'object' && obj[key].method === 'condition') {
        // obj[key] = context.getValue(obj[key].key);
        const conditionObj = obj[key];
        const methodToRunInOperationHandlers = `condition_${conditionObj.condition}`;
        const handler = operationHandlers[methodToRunInOperationHandlers];
        if (handler) {
          obj[key] = handler(context, conditionObj);
          console.log(`obj[key]:${obj[key]}`);
        } else {
          console.warn(`No handler for condition: ${conditionObj.condition}`);
        }
      }else if (obj[key] && typeof obj[key] === 'object' && obj[key].method === 'parametersFromRequest') {
        // "customer_id":"${this.$route.query.customer_id}"
        obj[key] = context.$route.query[obj[key].key];
      }else if(typeof obj[key] === 'object'){
        obj[key] = recursiveConversion(obj[key]);
      }else if (obj[key] && typeof obj[key] === 'object' && obj[key].method === 'environment') {
        // const variables = obj[key].variables;
        // const value = obj[key].value;
        
        // "value":"http://{{host}}/location"
        // obj[key] = context.$route.query[obj[key].key];
      }
    }
    console.log(`obj:${JSON.stringify(obj)}`);
    return obj;
  };
  return recursiveConversion(payload_in_json);
}

export {requestAjax, convertVariable};