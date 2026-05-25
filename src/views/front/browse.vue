<template>
  <div class="browse-page">
    <!-- 筛选栏 -->
    <div class="filter-bar">
      <div class="filter-row">
        <span class="filter-label">分类：</span>
        <div class="filter-options">
          <span
            class="filter-tag"
            :class="{ active: !filters.categoryId }"
            @click="filters.categoryId = null; doSearch()"
          >全部</span>
          <span
            v-for="cat in categories"
            :key="cat.categoryId"
            class="filter-tag"
            :class="{ active: filters.categoryId === cat.categoryId }"
            @click="filters.categoryId = cat.categoryId; doSearch()"
          >{{ cat.categoryName }}</span>
        </div>
      </div>
      <div class="filter-row">
        <span class="filter-label">年龄：</span>
        <div class="filter-options">
          <span
            class="filter-tag"
            :class="{ active: !filters.ageGroup }"
            @click="filters.ageGroup = null; doSearch()"
          >全部</span>
          <span
            v-for="age in ageGroups"
            :key="age"
            class="filter-tag"
            :class="{ active: filters.ageGroup === age }"
            @click="filters.ageGroup = age; doSearch()"
          >{{ age }}</span>
        </div>
      </div>
    </div>

    <!-- 搜索结果标题（搜索页） -->
    <div class="search-header" v-if="isSearch">
      <h3>"{{ keyword }}" 的搜索结果</h3>
    </div>

    <!-- 视频网格 -->
    <div class="video-grid" v-loading="loading">
      <div
        v-for="video in videoList"
        :key="video.videoId"
        class="video-card"
        @click="$router.push('/player/' + video.videoId)"
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
          <div class="video-meta">
            <el-tag size="small" v-if="video.ageGroup">{{ video.ageGroup }}</el-tag>
          </div>
        </div>
      </div>
      <div v-if="videoList.length === 0 && !loading" class="empty-state">
        <el-empty :description="isSearch ? '未找到相关视频' : '暂无视频'" />
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="total > pageSize">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        v-model:current-page="currentPage"
        @current-change="doSearch"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getVideoList, searchVideo } from '@/api/front/home'
import { listCategory } from '@/api/backstage/category'

const route = useRoute()
const loading = ref(false)
const videoList = ref([])
const categories = ref([])
const total = ref(0)
const pageSize = 12
const currentPage = ref(1)

const isSearch = computed(() => !!route.query.q)
const keyword = computed(() => route.query.q || '')

const ageGroups = ['0-2岁', '2-4岁', '4-6岁', '6-8岁', '8岁以上']

const filters = ref({
  categoryId: null,
  ageGroup: null
})

onMounted(() => {
  loadCategories()
  if (route.query.categoryId) {
    filters.value.categoryId = Number(route.query.categoryId)
  }
  doSearch()
})

watch(() => route.query.q, () => {
  currentPage.value = 1
  doSearch()
})

watch(() => route.query.categoryId, (newVal) => {
  filters.value.categoryId = newVal ? Number(newVal) : null
  currentPage.value = 1
  doSearch()
})

function loadCategories() {
  listCategory({ status: '0' }).then(res => {
    categories.value = res.rows || []
  }).catch(() => {})
}

function doSearch() {
  loading.value = true
  const params = {
    pageNum: currentPage.value,
    pageSize: pageSize,
    categoryId: filters.value.categoryId,
    ageGroup: filters.value.ageGroup,
    videoTitle: keyword.value || null
  }

  const api = isSearch.value ? searchVideo : getVideoList
  api(params).then(res => {
    videoList.value = res.rows || []
    total.value = res.total || 0
  }).catch(() => {}).finally(() => {
    loading.value = false
  })
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
.browse-page { padding-bottom: 20px; }

.filter-bar {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.filter-row:last-child { margin-bottom: 0; }

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  width: 60px;
  flex-shrink: 0;
}

.filter-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 5px 14px;
  border-radius: 16px;
  background: #f5f5f5;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-tag:hover { color: #409eff; }
.filter-tag.active { background: #409eff; color: #fff; }

.search-header { margin-bottom: 16px; }
.search-header h3 { font-size: 18px; color: #333; margin: 0; }

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
  display: flex; align-items: center; justify-content: center; color: #ccc;
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

.pagination { display: flex; justify-content: center; padding: 30px 0; }

.empty-state { grid-column: 1 / -1; padding: 60px 0; }

@media (max-width: 768px) {
  .video-grid { grid-template-columns: repeat(2, 1fr); }
  .filter-bar { padding: 12px; }
}
</style>
