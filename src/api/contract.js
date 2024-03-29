import request from "@/utils/request";

/**
 * 新增藏品
 *
 * @param {{
 *  remark?:	string; //备注
 *  name:	string;
 *  supply:	number;
 *  current:	number;
 *  desc:	string;
 *  images:	string[];
 *  authorId:	number;
 *  status:	string;// 状态(0:下架 1: 上架)
 *  contractId:	number;
 * }} collectionObj
 *
 * @returns
 */
export function addCollection(collectionObj) {
  return request({
    url: "/collection",
    headers: {
      isToken: true,
    },
    method: "post",
    data: collectionObj,
  });
}

/**
 * 更新藏品
 * @param {{
 *  remark?:	string; //备注
 *  name:	string;
 *  supply:	number;
 *  current:	number;
 *  desc:	string;
 *  images:	string[];
 *  authorId:	number;
 *  status:	string;// 状态(0:下架 1: 上架)
 *  contractId:	number;
 * }} collectionObj
 *
 * @returns
 */
export function updateCollection(collectionObj) {
  return request({
    url: "/collection",
    headers: {
      isToken: true,
    },
    method: "put",
    data: collectionObj,
  });
}

/**
 * 查询藏品列表
 *
 * @param {{
 *    pageNum?: number; // 当前页
 *    pageSize?: number; // 每页条数
 *    orderByColumn?: string; // 排序字段
 *    isAsc?: string; // 排序方式
 * }} params
 * @returns
 */
export function getContractList(params) {
  return request({
    url: "/contract/list",
    method: "get",
    params,
  });
}

/**
 * 查询藏品详情
 *
 * @param {string | number} id
 * @returns
 */
export function getCollectionDetailsById(id) {
  return request({
    url: "/collection/" + id,
    method: "get",
  });
}

/**
 * 批量删除藏品
 *
 * @param {string} ids 要删除的藏品ids
 * @returns
 */
export function deleteCollectionByIds(ids) {
  return request({
    url: "/collection/" + ids,
    method: "delete",
  });
}
