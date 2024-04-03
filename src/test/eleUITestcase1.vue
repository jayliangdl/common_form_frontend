<template>
  <div id="app">
    <el-form ref="form" :model="form" label-width="120px">
      <el-collapse accordion>
        <!-- 申请人资料 -->
        <el-collapse-item name="1">
          <template slot="title">申请人资料</template>
          <div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="申请人姓名">
                  <el-input v-model="form.userName" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="申请人账号">
                  <el-input v-model="form.userAccount" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属部门">
                  <el-input v-model="form.userDepartment" disabled></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱地址">
                  <el-input v-model="form.userEmail" disabled></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-collapse-item>
        <!-- 基本资料 -->
        <el-collapse-item name="2">
          <template slot="title">基本资料</template>
        </el-collapse-item>
        <!-- 产品详细资料 -->
        <el-collapse-item name="3">
          <template slot="title">产品资料</template>
        </el-collapse-item>
      </el-collapse>
      <el-button type="primary" @click="onSubmit">提交</el-button>
    </el-form>
  </div>
</template>

<script>
import {requestAjax} from '../util'

export default {
  data() {
    return {
      form: {},
      formId: null, // 需要从页面获取值并传入
      userToken: null, // 需要从 Session 获取值并传入
    }
  },
  methods: {
    // 获取表单初始值
    async getFormData() {
      const url = 'http://localhost:3000/initForm'
      const method = 'POST'
      const params = { formId: this.formId }
      const headers = { userToken: this.userToken }

      // 调用API获取表单初始值
      let response = await requestAjax({url, method, params, headers})
        .catch(err => console.error(err))
      
      if (response && response.data) {
        this.form = response.data // 初始赋值
      }
    },
    // 提交表单
    onSubmit() {
      // 提交逻辑待补充
    },
  },
  // 页面创建之后，立刻获取表单初始值
  created() {
    this.getFormData();
  },
}
</script>