import axios from 'axios'
import { getToken } from '@/utils/auth'
import { ElMessage, ElMessageBox } from 'element-plus'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 15000
})

service.interceptors.request.use(config => {
  const token = getToken()
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }
  return config
}, error => {
  return Promise.reject(error)
})

service.interceptors.response.use(response => {
  const res = response.data
  if (response.request.responseType === 'blob' || response.request.responseType === 'arraybuffer') {
    return response
  }
  if (res.code === 401) {
    ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
      confirmButtonText: '重新登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      location.href = '/login'
    })
    return Promise.reject(new Error('登录过期'))
  } else if (res.code !== 200) {
    ElMessage.error(res.msg || '请求失败')
    return Promise.reject(new Error(res.msg || 'Error'))
  }
  return res
}, error => {
  ElMessage.error(error.message || '网络错误')
  return Promise.reject(error)
})

export default service
