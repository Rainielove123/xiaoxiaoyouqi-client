<template>
  <div class="player-page">
    <div class="player-wrapper">
      <div class="video-container">
        <video
          ref="videoRef"
          class="video-player"
          :src="video.videoUrl"
          controls
          autoplay
          @timeupdate="onTimeUpdate"
          @ended="onEnded"
        />
      </div>

      <div class="video-detail">
        <h2 class="video-title">{{ video.videoTitle }}</h2>
        <div class="video-meta">
          <span class="meta-item">{{ formatCount(video.playCount) }}次播放</span>
          <span class="meta-item">{{ formatDuration(video.duration) }}</span>
          <el-tag size="small" v-if="video.ageGroup">{{ video.ageGroup }}</el-tag>
        </div>
        <div class="video-actions">
          <el-button
            :type="liked ? 'danger' : 'default'"
            :icon="liked ? 'StarFilled' : 'Star'"
            round
            @click="handleLike"
          >{{ liked ? '已点赞' : '点赞' }} {{ likeCount }}</el-button>
          <el-button
            :type="favorited ? 'warning' : 'default'"
            :icon="favorited ? 'StarFilled' : 'Star'"
            round
            @click="handleFavorite"
          >{{ favorited ? '已收藏' : '收藏' }}</el-button>
        </div>
        <div class="video-desc" v-if="video.description">
          <p>{{ video.description }}</p>
        </div>
        <div class="video-tags" v-if="video.tags">
          <el-tag v-for="tag in video.tags.split(',')" :key="tag" size="small" style="margin: 2px;">
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 相关推荐 -->
    <aside class="related-section" v-if="relatedVideos.length">
      <h3>相关推荐</h3>
      <div class="related-list">
        <div
          v-for="item in relatedVideos"
          :key="item.videoId"
          class="related-card"
          @click="$router.push('/player/' + item.videoId)"
        >
          <div class="related-cover">
            <img v-if="item.coverUrl" :src="item.coverUrl" alt="" />
            <div v-else class="cover-placeholder">
              <el-icon :size="28"><VideoFilled /></el-icon>
            </div>
            <span class="related-duration">{{ formatDuration(item.duration) }}</span>
          </div>
          <div class="related-info">
            <h4>{{ item.videoTitle }}</h4>
            <span class="related-views">{{ formatCount(item.playCount) }}次播放</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getVideoDetail, toggleLike, toggleFavorite, saveWatchProgress } from '@/api/front/home'
import { ElMessage } from 'element-plus'

const route = useRoute()
const videoRef = ref(null)
const video = ref({})
const relatedVideos = ref([])
const liked = ref(false)
const favorited = ref(false)
const likeCount = ref(0)
let lastProgressTime = 0

onMounted(() => {
  loadVideo()
})

watch(() => route.params.videoId, () => {
  loadVideo()
})

function loadVideo() {
  const videoId = route.params.videoId
  if (!videoId) return
  getVideoDetail(videoId).then(res => {
    video.value = res.data || {}
    likeCount.value = video.value.likeCount || 0
  }).catch(() => {})
}

function onTimeUpdate() {
  if (!videoRef.value) return
  const now = Math.floor(videoRef.value.currentTime)
  if (now - lastProgressTime >= 10) {
    lastProgressTime = now
    const videoId = route.params.videoId
    if (videoId) {
      saveWatchProgress(videoId, now).catch(() => {})
    }
  }
}

function onEnded() {
  const videoId = route.params.videoId
  if (videoId) {
    saveWatchProgress(videoId, video.value.duration || 0).catch(() => {})
  }
}

function handleLike() {
  const videoId = route.params.videoId
  if (!videoId) return
  toggleLike(videoId).then(() => {
    liked.value = !liked.value
    likeCount.value += liked.value ? 1 : -1
    ElMessage.success(liked.value ? '点赞成功' : '已取消点赞')
  }).catch(() => {})
}

function handleFavorite() {
  const videoId = route.params.videoId
  if (!videoId) return
  toggleFavorite(videoId).then(() => {
    favorited.value = !favorited.value
    ElMessage.success(favorited.value ? '收藏成功' : '已取消收藏')
  }).catch(() => {})
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatCount(num) {
  if (!num) return 0
  return num >= 10000 ? (num / 10000).toFixed(1) + '万' : num
}
</script>

<style scoped>
.player-page {
  display: flex;
  gap: 24px;
}

.player-wrapper {
  flex: 1;
  max-width: 860px;
}

.video-container {
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.video-player {
  width: 100%;
  display: block;
  aspect-ratio: 16/9;
}

.video-detail {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.video-title { font-size: 20px; margin: 0 0 12px; color: #222; }

.video-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #999;
}

.video-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.video-desc {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
}
.video-desc p { margin: 0; font-size: 14px; color: #666; line-height: 1.6; }

.video-tags { display: flex; flex-wrap: wrap; }

.related-section {
  width: 320px;
  flex-shrink: 0;
}
.related-section h3 { font-size: 18px; margin: 0 0 16px; color: #333; }

.related-list { display: flex; flex-direction: column; gap: 12px; }

.related-card {
  display: flex;
  gap: 10px;
  background: #fff;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}
.related-card:hover { transform: translateY(-2px); }

.related-cover {
  position: relative;
  width: 140px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #e8e8e8;
  flex-shrink: 0;
}
.related-cover img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: #ccc;
}
.related-duration {
  position: absolute; bottom: 4px; right: 4px;
  background: rgba(0,0,0,0.7); color: #fff; font-size: 11px;
  padding: 1px 5px; border-radius: 3px;
}
.related-info { flex: 1; }
.related-info h4 {
  font-size: 13px; margin: 0 0 6px; color: #333;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
.related-views { font-size: 12px; color: #999; }

@media (max-width: 768px) {
  .player-page { flex-direction: column; }
  .related-section { width: 100%; }
  .related-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .related-card { flex-direction: column; padding: 8px; }
  .related-cover { width: 100%; height: 100px; }
}
</style>
