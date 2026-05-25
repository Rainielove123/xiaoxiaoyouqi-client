<template>
  <div class="user-page">
    <div class="user-header">
      <div class="user-card">
        <el-avatar :size="64" icon="UserFilled" />
        <div class="user-info">
          <h2 v-if="isLogin">{{ userStore.name || '小朋友' }}</h2>
          <h2 v-else>未登录</h2>
          <p>欢迎来到小铃铛英语</p>
        </div>
        <el-button v-if="!isLogin" type="primary" round @click="$router.push('/login')">立即登录</el-button>
      </div>
    </div>

    <!-- 数据概览 -->
    <div class="stats-row" v-if="isLogin">
      <div class="stat-card">
        <span class="stat-num">{{ favoriteTotal }}</span>
        <span class="stat-label">收藏</span>
      </div>
      <div class="stat-card">
        <span class="stat-num">{{ historyTotal }}</span>
        <span class="stat-label">观看记录</span>
      </div>
    </div>

    <!-- 标签切换 -->
    <div class="user-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="我的收藏" name="favorites">
          <div class="video-grid" v-loading="favLoading">
            <div
              v-for="item in favorites"
              :key="item.favoriteId"
              class="video-card"
              @click="$router.push('/player/' + item.videoId)"
            >
              <div class="video-cover">
                <img v-if="item.coverUrl" :src="item.coverUrl" alt="" />
                <div v-else class="cover-placeholder">
                  <el-icon :size="40"><VideoFilled /></el-icon>
                </div>
              </div>
              <div class="video-info">
                <h4>{{ item.videoTitle }}</h4>
              </div>
            </div>
            <div v-if="favorites.length === 0 && !favLoading" class="empty-state">
              <el-empty description="还没有收藏视频，快去发现精彩内容吧" />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="观看历史" name="history">
          <div class="video-grid" v-loading="hisLoading">
            <div
              v-for="item in history"
              :key="item.historyId"
              class="video-card"
              @click="$router.push('/player/' + item.videoId)"
            >
              <div class="video-cover">
                <img v-if="item.coverUrl" :src="item.coverUrl" alt="" />
                <div v-else class="cover-placeholder">
                  <el-icon :size="40"><VideoFilled /></el-icon>
                </div>
                <div class="progress-bar" v-if="item.watchProgress">
                  <div class="progress-inner" :style="{ width: progressPercent(item) + '%' }"></div>
                </div>
              </div>
              <div class="video-info">
                <h4>{{ item.videoTitle }}</h4>
                <span class="progress-text" v-if="item.watchProgress">
                  已看 {{ formatDuration(item.watchProgress) }}
                </span>
              </div>
            </div>
            <div v-if="history.length === 0 && !hisLoading" class="empty-state">
              <el-empty description="暂无观看记录" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getToken } from '@/utils/auth'
import useUserStore from '@/store/modules/user'
import { getFavorites, getWatchHistory } from '@/api/front/home'

const userStore = useUserStore()
const isLogin = computed(() => !!getToken())

const activeTab = ref('favorites')
const favorites = ref([])
const history = ref([])
const favLoading = ref(false)
const hisLoading = ref(false)

const favoriteTotal = computed(() => favorites.value.length)
const historyTotal = computed(() => history.value.length)

onMounted(() => {
  if (isLogin.value) {
    loadFavorites()
    loadHistory()
  }
})

function loadFavorites() {
  favLoading.value = true
  getFavorites().then(res => {
    favorites.value = res.data || res.rows || []
  }).catch(() => {}).finally(() => {
    favLoading.value = false
  })
}

function loadHistory() {
  hisLoading.value = true
  getWatchHistory().then(res => {
    history.value = res.data || res.rows || []
  }).catch(() => {}).finally(() => {
    hisLoading.value = false
  })
}

function progressPercent(item) {
  if (!item.watchProgress || !item.duration) return 0
  return Math.min(Math.round((item.watchProgress / item.duration) * 100), 100)
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
</script>

<style scoped>
.user-page { padding-bottom: 20px; }

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(135deg, #409eff 0%, #67c2ff 100%);
  border-radius: 16px;
  padding: 24px 30px;
  color: #fff;
}
.user-info { flex: 1; }
.user-info h2 { margin: 0 0 4px; font-size: 22px; }
.user-info p { margin: 0; font-size: 14px; opacity: 0.85; }

.stats-row { display: flex; gap: 16px; margin: 20px 0; }
.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-num { font-size: 28px; font-weight: 700; color: #409eff; }
.stat-label { font-size: 13px; color: #999; }

.user-tabs { background: #fff; border-radius: 12px; padding: 10px 20px 20px; }

.video-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.video-card {
  background: #f9f9f9;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}
.video-card:hover { transform: translateY(-3px); }

.video-cover {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: #e8e8e8;
  overflow: hidden;
}
.video-cover img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center; color: #ccc;
}

.progress-bar {
  position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: rgba(255,255,255,0.4);
}
.progress-inner {
  height: 100%;
  background: #67c23a;
  transition: width 0.3s;
}

.video-info { padding: 10px 12px; }
.video-info h4 {
  font-size: 14px; margin: 0 0 4px; color: #333;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.progress-text { font-size: 12px; color: #67c23a; }

.empty-state { grid-column: 1 / -1; padding: 40px 0; }

@media (max-width: 768px) {
  .video-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
