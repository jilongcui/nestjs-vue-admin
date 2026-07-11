import request from "@/utils/request";

// 查询会员订单列表
export function listMemberOrder(query) {
  return request({
    url: "/order/admin/list",
    method: "get",
    params: query,
  });
}
