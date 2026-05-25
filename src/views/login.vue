<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <span class="logo-icon">🐳</span>
        <h2>小铃铛英语</h2>
        <p>儿童视频乐园</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" size="large">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" @keyup.enter="handleLogin" />
        </el-form-item>
        <el-form-item prop="code" v-if="captchaEnabled">
          <div class="captcha-row">
            <el-input v-model="form.code" placeholder="验证码" style="width: 60%" />
            <img :src="captchaImg" class="captcha-img" @click="refreshCaptcha" title="点击刷新验证码" />
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" block round @click="handleLogin">
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <router-link to="/home">← 返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useUserStore from '@/store/modules/user'
import { getCaptcha } from '@/api/login'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const formRef = ref(null)
const captchaEnabled = ref(false)
const captchaImg = ref('')
const captchaUuid = ref('')

const form = reactive({
  username: 'admin',
  password: 'admin123',
  code: ''
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

onMounted(() => {
  refreshCaptcha()
})

function refreshCaptcha() {
  getCaptcha().then(res => {
    captchaEnabled.value = res.captchaEnabled !== false
    if (captchaEnabled.value) {
      captchaImg.value = 'data:image/jpg;base64,' + res.img
      captchaUuid.value = res.uuid
    }
  }).catch(() => {})
}

function handleLogin() {
  formRef.value.validate(valid => {
    if (!valid) return
    loading.value = true
    const loginData = {
      username: form.username,
      password: form.password
    }
    if (captchaEnabled.value) {
      loginData.code = form.code
      loginData.uuid = captchaUuid.value
    }
    userStore.login(loginData).then(() => {
      return userStore.getInfo()
    }).then(() => {
      ElMessage.success('登录成功')
      router.push('/home')
    }).catch(() => {
      loading.value = false
      refreshCaptcha()
      form.code = ''
    })
  })
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8f4fc 0%, #f0e6ff 100%);
}

.login-card {
  width: 400px;
  background: #fff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.logo-icon { font-size: 48px; }
.login-header h2 {
  margin: 8px 0 4px;
  font-size: 24px;
  color: #333;
}
.login-header p {
  margin: 0;
  font-size: 14px;
  color: #999;
}

.captcha-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.captcha-img {
  height: 40px;
  width: 35%;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid #dcdfe6;
}

.login-footer {
  text-align: center;
  margin-top: 16px;
}
.login-footer a {
  color: #999;
  text-decoration: none;
  font-size: 14px;
}
.login-footer a:hover { color: #409eff; }
</style>
