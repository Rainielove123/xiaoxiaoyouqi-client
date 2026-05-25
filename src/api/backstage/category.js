import request from '@/utils/request'

// 查询视频分类列表
export function listCategory(query) {
  return request({
    url: '/backstage/category/list',
    method: 'get',
    params: query
  })
}

// 查询视频分类详细
export function getCategory(categoryId) {
  return request({
    url: '/backstage/category/' + categoryId,
    method: 'get'
  })
}

// 新增视频分类
export function addCategory(data) {
  return request({
    url: '/backstage/category',
    method: 'post',
    data: data
  })
}

// 修改视频分类
export function updateCategory(data) {
  return request({
    url: '/backstage/category',
    method: 'put',
    data: data
  })
}

// 删除视频分类
export function delCategory(categoryId) {
  return request({
    url: '/backstage/category/' + categoryId,
    method: 'delete'
  })
}
