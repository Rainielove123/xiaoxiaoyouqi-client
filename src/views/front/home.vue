<template>
  <div class="home-page">
    <!-- 轮播Banner -->
    <section class="banner-section">
      <el-carousel :interval="4000" type="card" height="280px" indicator-position="none">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <div class="banner-card" :style="{ background: item.bgColor }" @click="toPlayer(item.videoId)">
            <div class="banner-info">
              <h2>{{ item.title }}</h2>
              <p>{{ item.desc }}</p>
            </div>
            <div class="banner-img">
              <img v-if="item.coverUrl" :src="item.coverUrl" alt="" />
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 分类入口 -->
    <section class="category-section">
      <div class="category-grid">
        <div
          v-for="cat in categories"
          :key="cat.categoryId"
          class="category-card"
          :style="{ background: cat.bg }"
          @click="$router.push({ path: '/browse', query: { categoryId: cat.categoryId } })"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.categoryName }}</span>
        </div>
      </div>
    </section>

    <!-- 适龄段快捷筛选 -->
    <section class="age-section">
      <div class="section-title">
        <h3>按年龄选内容</h3>
      </div>
      <div class="age-tags">
        <span
          v-for="age in ageGroups"
          :key="age"
          class="age-tag"
          :class="{ active: activeAge === age }"
          @click="activeAge = activeAge === age ? '' : age"
        >{{ age }}</span>
      </div>
    </section>

    <!-- 推荐视频 -->
    <section class="video-section">
      <div class="section-title">
        <h3>{{ activeAge ? activeAge + ' · 热门推荐' : '热门推荐' }}</h3>
        <el-button type="primary" link @click="$router.push('/browse')">查看更多</el-button>
      </div>
      <div class="video-grid" v-loading="loading">
        <div
          v-for="video in filteredVideos"
          :key="video.videoId"
          class="video-card"
          @click="toPlayer(video.videoId)"
        >
          <div class="video-cover">
            <img v-if="video.coverUrl" :src="video.coverUrl" alt="" />
            <div v-else class="cover-placeholder">
              <el-icon :size="40"><VideoFilled /></el-icon>
            </div>
            <span class="video-duration">{{ formatDuration(video.duration) }}</span>
            <span class="video-play-count">{{ formatCount(video.playCount) }}次播放</span>
          </div>
          <div class="video-info">
            <h4 class="video-title">{{ video.videoTitle }}</h4>
            <div class="video-tags">
              <el-tag size="small" v-if="video.ageGroup">{{ video.ageGroup }}</el-tag>
            </div>
          </div>
        </div>
        <div v-if="filteredVideos.length === 0 && !loading" class="empty-state">
          <el-empty description="暂无视频" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRecommendVideos } from '@/api/front/home'
import { listCategory } from '@/api/backstage/category'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const videos = ref([])
const activeAge = ref('')
const categories = ref([])
const categoryIcons = ['🔤', '🔢', '🔬', '🎨', '🌙', '🌟', '🎵', '📖']
const categoryColors = ['#fff0f5', '#f0f5ff', '#f0fff4', '#fff8f0', '#f5f0ff', '#fff0f0', '#f0ffff', '#fffff0']

const banners = ref([
  { id: 1, title: '小猪佩奇', desc: '和佩奇一起学英语', bgColor: '#ffe0e6', coverUrl: '', videoId: null },
  { id: 2, title: '数学小天才', desc: '趣味数学启蒙', bgColor: '#e0f0ff', coverUrl: '', videoId: null },
  { id: 3, title: '科学大发现', desc: '探索奇妙世界', bgColor: '#e0ffe8', coverUrl: '', videoId: null }
])

const ageGroups = ['0-2岁', '2-4岁', '4-6岁', '6-8岁', '8岁以上']

const filteredVideos = computed(() => {
  if (!activeAge.value) return videos.value
  return videos.value.filter(v => v.ageGroup === activeAge.value)
})

onMounted(() => {
  fetchVideos()
  fetchCategories()
})

function fetchVideos() {
  loading.value = true
  getRecommendVideos().then(res => {
    videos.value = res.data || []
  }).catch(() => {}).finally(() => {
    loading.value = false
  })
}

function fetchCategories() {
  listCategory({ status: '0' }).then(res => {
    const list = res.rows || []
    categories.value = list.map((cat, i) => ({
      ...cat,
      icon: categoryIcons[i % categoryIcons.length],
      bg: categoryColors[i % categoryColors.length]
    }))
  }).catch(() => {})
}

function toPlayer(videoId) {
  if (videoId) {
    router.push('/player/' + videoId)
  }
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
.home-page { padding-bottom: 20px; }

.banner-section { margin-bottom: 30px; }
.banner-card {
  height: 280px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30px 40px;
  cursor: pointer;
  overflow: hidden;
}
.banner-info h2 { font-size: 28px; margin: 0 0 10px; color: #333; }
.banner-info p { font-size: 16px; color: #666; margin: 0; }
.banner-img { width: 200px; height: 200px; border-radius: 12px; overflow: hidden; background: rgba(255,255,255,0.5); }
.banner-img img { width: 100%; height: 100%; object-fit: cover; }

.category-section { margin-bottom: 30px; }
.category-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 10px;
  border-radius: 14px;
  cursor: pointer;
  transition: transform 0.2s;
}
.category-card:hover { transform: translateY(-3px); }
.cat-icon { font-size: 36px; margin-bottom: 8px; }
.cat-name { font-size: 14px; font-weight: 500; color: #555; }

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-title h3 { font-size: 20px; margin: 0; color: #333; }

.age-section { margin-bottom: 30px; }
.age-tags { display: flex; gap: 12px; flex-wrap: wrap; }
.age-tag {
  padding: 8px 20px;
  border-radius: 20px;
  background: #fff;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  border: 1px solid #e8e8e8;
  transition: all 0.2s;
}
.age-tag:hover { border-color: #409eff; color: #409eff; }
.age-tag.active { background: #409eff; color: #fff; border-color: #409eff; }

.video-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.video-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.video-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }

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
  display: flex; align-items: center; justify-content: center;
  color: #ccc;
}
.video-duration {
  position: absolute; bottom: 6px; right: 6px;
  background: rgba(0,0,0,0.7); color: #fff; font-size: 12px;
  padding: 2px 6px; border-radius: 4px;
}
.video-play-count {
  position: absolute; bottom: 6px; left: 6px;
  background: rgba(0,0,0,0.5); color: #fff; font-size: 11px;
  padding: 2px 6px; border-radius: 4px;
}
.video-info { padding: 10px 12px; }
.video-title {
  font-size: 14px; margin: 0 0 6px; color: #333;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.video-tags { display: flex; gap: 6px; }

.empty-state { grid-column: 1 / -1; padding: 60px 0; }

@media (max-width: 768px) {
  .category-grid { grid-template-columns: repeat(3, 1fr); }
  .video-grid { grid-template-columns: repeat(2, 1fr); }
  .banner-card { height: 180px; padding: 20px; }
  .banner-info h2 { font-size: 20px; }
}
</style>
