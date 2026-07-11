import request from "@/utils/request";

// 查询邀请列表（树）
export function inviteTree(query) {
  return request({
    url: "/invite/tree",
    method: "get",
    params: query,
  });
}

export function getChildrenFlatList(userId) {
  return request({
    url: "/invite/tree",
    method: "get",
    params: {
      userId,
    },
  });
}

// 查询邀请学生的充值统计
export function getStudentEarnings(query) {
  return request({
    url: "/invite/students/earnings",
    method: "get",
    params: query,
  });
}

// 查询某个学生的购买记录（分页）
export function getStudentOrders(studentId, query) {
  return request({
    url: "/invite/students/" + studentId + "/orders",
    method: "get",
    params: query,
  });
}
