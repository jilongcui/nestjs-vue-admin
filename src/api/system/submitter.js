import request from "@/utils/request";

/**
 * 查询Submitter列表
 *
 * @param {{
 *    pageNum?: number; // 当前页
 *    pageSize?: number; // 每页条数
 *    status:	string;
 * }} params
 * @returns
 */
export function getSubmitterList(params) {
  return request({
    url: "/submitter/list",
    method: "get",
    params,
  });
}

/**
 * 查询Submitter详情
 *
 * @param {string | number} id
 * @returns
 */
export function getSubmitter(id) {
  return request({
    url: "/submitter/" + id,
    method: "get",
  });
}

/**
 * 批量删除Submitter
 *
 * @param {string} ids 要删除的Submitterids
 * @returns
 */
export function deleteSubmitterByIds(ids) {
  return request({
    url: "/submitter/" + ids,
    method: "delete",
  });
}
