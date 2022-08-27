import request from "@/utils/request";

/**
 * 查询订单列表
 *
 * @param {{
 *    type: 0 | 1 | 2 | 3; // 类型 0:首发 1:盲盒 2:预售 3:秒杀
 *    title: string; // 标题
 *    pageNum?: number; // 当前页
 *    pageSize?: number; // 每页条数
 *    orderByColumn?: string; // 排序字段
 *    isAsc?: string; // 排序方式
 *    status?: '0' | '1' | '2' | '3' | '4' | '5'; // 状态 0: 未展出 1:展示 2:预售 3:发货中 4:销售结束 5:取消
 * }} params
 * @returns
 */
export function getOrderList(params) {
  return request({
    url: "/order/list",
    method: "get",
    params,
  });
}

/**
 * 查询订单详情
 *
 * @param {string | number} id
 * @returns
 */
export function getOrderDetailsById(id) {
  return request({
    url: "/order/" + id,
    method: "get",
  });
}

/**
 * 删除订单
 *
 * @param {string} id 要删除的订单id
 * @returns
 */
export function deleteOrderById(id) {
  return request({
    url: "/order/" + id,
    method: "delete",
  });
}
/**
 * 批量删除订单
 *
 * @param {string} ids 要删除的订单ids
 * @returns
 */
export function deleteOrderByIds(ids) {
  return request({
    url: "/order/" + ids,
    method: "delete",
  });
}
