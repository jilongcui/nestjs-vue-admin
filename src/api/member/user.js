import request from '@/utils/request'

// 查询会员用户列表
export function listMemberUser(query) {
  return request({
    url: '/user/list',
    method: 'get',
    params: query
  })
}

// 查看会员用户详细
export function getMemberUser(userId) {
  return request({
    url: '/user/' + userId,
    method: 'get'
  })
}

// 删除会员用户
export function delMemberUser(userId) {
  return request({
    url: '/user/' + userId,
    method: 'delete'
  })
}

// 改变会员用户状态
export function changeMemberUserStatus(userId, status) {
  const data = {
    userId,
    status
  }
  return request({
    url: '/user/changeStatus',
    method: 'put',
    data: data
  })
}
