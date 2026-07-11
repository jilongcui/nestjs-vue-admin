import request from "@/utils/request";

// 查询支付记录列表
export function listMemberPayment(query) {
  return request({
    url: "/payment/admin/list",
    method: "get",
    params: query,
  });
}
