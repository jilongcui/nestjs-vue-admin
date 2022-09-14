import request from "@/utils/request";

/**
 * 查询提现列表
 *
 * @param {{
 *    type: "1" | "2" | "3"; // 类型 1:银行卡 2:微信 3:支付宝
 *    id: string | number; 
 *    pageNum?: number; // 当前页
 *    pageSize?: number; // 每页条数
 *    withdrawByColumn?: string; // 排序字段
 *    isAsc?: string; // 排序方式
 *    status?: '0' | '1' | '2' | '3' | '4' | '5'; // 状态  0: 未审核 1: 提现中 2: 提现完成 3:取消提现 4: 提现失败 5:审核失败
 * }} params
 * @returns
 */
export function getWithdrawList(params) {
  return request({
    url: "/fund/withdraw/list",
    method: "get",
    params,
  });
}
