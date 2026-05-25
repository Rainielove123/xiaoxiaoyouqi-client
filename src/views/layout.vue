<template>
  <div class="front-layout">
    <!-- 顶部导航 -->
    <header class="front-header">
      <div class="header-inner">
        <router-link to="/home" class="logo">
          <span class="logo-icon">🐳</span>
          <span class="logo-text">小铃铛英语</span>
        </router-link>
        <div class="header-search" v-if="showSearch">
          <el-input
            v-model="keyword"
            placeholder="搜索动画、儿歌、故事..."
            size="large"
            clearable
            @keyup.enter="doSearch"
          >
            <template #suffix>
              <el-icon @click="doSearch" style="cursor:pointer"><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="header-actions">
          <template v-if="isLogin">
            <el-dropdown trigger="click">
              <el-avatar :size="36" icon="UserFilled" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$router.push('/my')">个人中心</el-dropdown-item>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button type="primary" size="default" round @click="toLogin">登录</el-button>
          </template>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="front-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 底部导航 -->
    <nav class="bottom-nav">
      <router-link to="/home" class="nav-item" :class="{ active: $route.path === '/home' }">
        <el-icon><HomeFilled /></el-icon>
        <span>首页</span>
      </router-link>
      <router-link to="/browse" class="nav-item" :class="{ active: $route.path === '/browse' }">
        <el-icon><Grid /></el-icon>
        <span>分类</span>
      </router-link>
      <router-link to="/my" class="nav-item" :class="{ active: $route.path === '/my' }">
        <el-icon><UserFilled /></el-icon>
        <span>我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getToken, removeToken } from '@/utils/auth'
import useUserStore from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()
const keyword = ref('')
const isLogin = computed(() => !!getToken())

const props = defineProps({
  showSearch: { type: Boolean, default: true }
})

function doSearch() {
  const kw = keyword.value.trim()
  if (kw) {
    router.push({ path: '/search', query: { q: kw } })
  }
}

function toLogin() {
  router.push('/login')
}

function handleLogout() {
  userStore.logOut().then(() => {
    router.push('/home')
  })
}
</script>

<style scoped>
.front-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f5f7fb;
}

.front-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  height: 60px;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 20px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-icon { font-size: 28px; }
.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
  letter-spacing: 1px;
}

.header-search {
  flex: 1;
  max-width: 480px;
}

.header-actions {
  flex-shrink: 0;
}

.front-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 120px);
}

.bottom-nav {
  position: sticky;
  bottom: 0;
  z-index: 100;
  background: #fff;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-around;
  height: 56px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  color: #999;
  font-size: 12px;
  flex: 1;
  transition: color 0.2s;
}
.nav-item.active {
  color: #409eff;
}
.nav-item .el-icon {
  font-size: 22px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .header-search {
    max-width: 240px;
  }
  .front-main {
    padding: 12px;
  }
}
</style>
