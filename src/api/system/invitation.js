import request from "@/utils/request";

// 查询邀请列表
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
