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
 *    contractId?: number; // 合约ID
 *    status?: '0' | '1'; // 状态(0:下架 1: 上架)
 *    name?: string; // 藏品名称
 *    authorId?: number; // 作者ID
 * }} params
 * @returns
 */
export function getCollectionList(params) {
  return request({
    url: "/collection/list",
    method: "get",
    params,
  });
}

/**
 * 查询未参与活动的藏品列表
 *
 * @param {{
 *    pageNum?: number; // 当前页
 *    pageSize?: number; // 每页条数
 *    orderByColumn?: string; // 排序字段
 *    isAsc?: string; // 排序方式
 *    contractId?: number; // 合约ID
 *    status?: '0' | '1'; // 状态(0:下架 1: 上架)
 *    name?: string; // 藏品名称
 *    authorId?: number; // 作者ID
 * }} params
 * @returns
 */
export function getCollectionNewList(params) {
  return request({
    url: "/collection/newList",
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

/**
 * 设置藏品是否允许交易
 *
 * @param {string} id 藏品ID
 * @param {boolean} allow 是否允许交易
 */
export function setAllowSell(id, allow) {
  return request({
    url: `/collection/${id}/${allow ? "openMarket" : "closeMarket"}`,
    method: "put",
  });
}
