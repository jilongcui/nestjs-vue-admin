import request from "@/utils/request";

/**
 * 新增活动
 *
 * @param {{
 *  collections: {id:string}[];
 *  type:	0 | 1 | 2 | 3; // 类型 0:首发 1:盲盒 2:预售 3:秒杀
 *  title:	string;
 *  ruleInfo:	string;
 *  startTime: string;
 *  endTime: string;
 *  coverImage: string;
 *  current:	number;
 *  price:	number;
 *  status?:	'0' | '1' | '2' | '3' | '4' | '5';  // 状态 0: 未展出 1:展示 2:预售 3:发货中 4:销售结束 5:取消
 * }} activityObj
 *
 * @returns
 */
export function addActivity(activityObj) {
  return request({
    url: "/activity",
    headers: {
      isToken: true,
    },
    method: "post",
    data: activityObj,
  });
}

/**
 * 更新活动
 *
 * @param {{
 *  collections: {id:string}[];
 *  type:	0 | 1 | 2 | 3; // 类型 0:首发 1:盲盒 2:预售 3:秒杀
 *  title:	string;
 *  ruleInfo:	string;
 *  startTime: string;
 *  endTime: string;
 *  coverImage: string;
 *  current:	number;
 *  price:	number;
 *  status?:	'0' | '1' | '2' | '3' | '4' | '5';  // 状态 0: 未展出 1:展示 2:预售 3:发货中 4:销售结束 5:取消
 * }} activityObj
 * @param {string | number} id
 * @returns
 */
export function updateActivity(activityObj, id) {
  return request({
    url: "/activity/" + id,
    headers: {
      isToken: true,
    },
    method: "put",
    data: activityObj,
  });
}

/**
 * 置顶/取消置顶
 * @param {boolean} top
 * @returns
 */
export function setTop(top, id) {
  console.log("setTop:", top, id);
  return request({
    url: `/activity/${id}/${top ? "top" : "untop"}`,
    headers: {
      isToken: true,
    },
    method: "put",
  });
}

/**
 * 查询活动列表
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
export function getActivityList(params) {
  return request({
    url: "/activity/list",
    method: "get",
    params,
  });
}

/**
 * 查询活动详情
 *
 * @param {string | number} id
 * @returns
 */
export function getActivityDetailsById(id) {
  return request({
    url: "/activity/" + id,
    method: "get",
  });
}

/**
 * 删除活动
 *
 * @param {string} id 要删除的活动id
 * @returns
 */
export function deleteActivityById(id) {
  return request({
    url: "/activity/" + id,
    method: "delete",
  });
}
/**
 * 批量删除活动
 *
 * @param {string} ids 要删除的活动ids
 * @returns
 */
export function deleteActivityByIds(ids) {
  return request({
    url: "/activity/" + ids,
    method: "delete",
  });
}

/**
 * 添加藏品到活动
 *
 * @param {string | number} activityId
 * @param {string | number} collectionId
 * @returns
 */
export function appendCollectionToActivity(activityId, collectionId) {
  return request({
    url: `/activity/${activityId}/collection/${collectionId}`,
    method: "put",
  });
}
/**
 * 从活动中移除藏品
 *
 * @param {string | number} activityId
 * @param {string | number} collectionId
 * @returns
 */
export function removeCollectionFromActivity(activityId, collectionId) {
  return request({
    url: `/activity/${activityId}/collection/${collectionId}`,
    method: "delete",
  });
}

/**
 * 设置活动开始
 *
 * @param {string | number} activityId
 * @returns
 */
export function setActivityStart(activityId) {
  return request({
    url: `/activity/${activityId}/start`,
    method: "put",
  });
}

/**
 * 设置活动开始
 *
 * @param {string | number} activityId
 * @returns
 */
export function setActivityEnd(activityId) {
  return request({
    url: `/activity/${activityId}/finish`,
    method: "put",
  });
}

/**
 * 设置活动藏品售罄
 *
 * @param {string | number} activityId
 * @returns
 */
export function setActivitySellOut(activityId) {
  return request({
    url: `/activity/${activityId}/sellOut`,
    method: "put",
  });
}
