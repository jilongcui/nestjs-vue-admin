import request from '@/utils/request'

// ============= 老师档案 =============

// 查询老师档案列表
export function listTeacherProfile(query) {
  return request({ url: '/teachers/list', method: 'get', params: query })
}

// 查询老师档案详情
export function getTeacherProfile(userId) {
  return request({ url: '/teachers/' + userId, method: 'get' })
}

// 更新老师档案
export function updateTeacherProfile(userId, data) {
  return request({ url: '/teachers/' + userId, method: 'patch', data })
}

// ============= 课程 =============

export function listCourse(query) {
  return request({ url: '/sys/course', method: 'get', params: query })
}
export function getCourse(id) {
  return request({ url: '/sys/course/' + id, method: 'get' })
}
export function addCourse(data) {
  return request({ url: '/sys/course', method: 'post', data })
}
export function updateCourse(id, data) {
  return request({ url: '/sys/course/' + id, method: 'patch', data })
}
export function delCourse(id) {
  return request({ url: '/sys/course/' + id, method: 'delete' })
}

// ============= 排期 =============

export function getCourseSchedule(courseId, date) {
  return request({ url: '/sys/course/' + courseId + '/schedule', method: 'get', params: { date } })
}
export function batchCreateSchedule(courseId, data) {
  return request({ url: '/sys/course/' + courseId + '/schedule/batch', method: 'post', data })
}

// ============= 预约 =============

export function listAllBookings(query) {
  return request({ url: '/sys/course/bookings/all', method: 'get', params: query })
}
