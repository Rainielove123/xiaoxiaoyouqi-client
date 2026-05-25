import { defineStore } from 'pinia'
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    name: '',
    avatar: ''
  }),
  actions: {
    login(userInfo) {
      return new Promise((resolve, reject) => {
        login(userInfo).then(res => {
          setToken(res.token)
          this.token = res.token
          resolve()
        }).catch(err => reject(err))
      })
    },
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo().then(res => {
          const user = res.user
          this.name = user.userName || ''
          this.avatar = user.avatar || ''
          resolve(res)
        }).catch(err => reject(err))
      })
    },
    logOut() {
      return new Promise((resolve) => {
        logout().then(() => {}).catch(() => {}).finally(() => {
          this.token = ''
          this.name = ''
          this.avatar = ''
          removeToken()
          resolve()
        })
      })
    }
  }
})

export default useUserStore
