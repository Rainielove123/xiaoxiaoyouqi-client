import request from '@/utils/request'

// 获取首页推荐视频
export function getRecommendVideos() {
  return request({
    url: '/front/home/recommend',
    method: 'get'
  })
}

// 获取轮播图
export function getBanners() {
  return request({
    url: '/front/home/banners',
    method: 'get'
  })
}

// 获取视频详情
export function getVideoDetail(videoId) {
  return request({
    url: '/front/video/' + videoId,
    method: 'get'
  })
}

// 获取视频列表（分类筛选）
export function getVideoList(params) {
  return request({
    url: '/front/video/list',
    method: 'get',
    params
  })
}

// 搜索视频
export function searchVideo(params) {
  return request({
    url: '/front/video/search',
    method: 'get',
    params
  })
}

// 点赞/取消点赞视频
export function toggleLike(videoId) {
  return request({
    url: '/front/video/' + videoId + '/like',
    method: 'post'
  })
}

// 收藏/取消收藏视频
export function toggleFavorite(videoId) {
  return request({
    url: '/front/video/' + videoId + '/favorite',
    method: 'post'
  })
}

// 获取收藏列表
export function getFavorites() {
  return request({
    url: '/front/user/favorites',
    method: 'get'
  })
}

// 获取观看历史
export function getWatchHistory() {
  return request({
    url: '/front/user/history',
    method: 'get'
  })
}

// 记录观看进度
export function saveWatchProgress(videoId, progress) {
  return request({
    url: '/front/video/' + videoId + '/progress',
    method: 'post',
    data: { progress }
  })
}
