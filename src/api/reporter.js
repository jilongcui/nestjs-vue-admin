import request from '@/utils/request'

// 查询反馈列表
export function listReporter(query) {
  return request({ url: '/sys/reporter/list', method: 'get', params: query })
}

// 查询反馈详情
export function getReporter(id) {
  return request({ url: '/sys/reporter/' + id, method: 'get' })
}

// 标记已处理
export function markReporterRead(id) {
  return request({ url: '/sys/reporter/' + id + '/read', method: 'put' })
}

// 更新反馈
export function updateReporter(id, data) {
  return request({ url: '/sys/reporter/' + id, method: 'patch', data })
}

// 批量标记已处理
export function batchReadReporter(ids) {
  return request({ url: '/sys/reporter/batch/read', method: 'put', data: { ids } })
}

// 删除反馈
export function delReporter(id) {
  return request({ url: '/sys/reporter/' + id, method: 'delete' })
}
