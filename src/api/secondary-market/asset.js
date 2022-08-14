import request from "@/utils/request";


/**
 * 更新Asset
 * @param {{
 *  id:	string;
 *  desc?:	string;
 *  position:	string;
 *  scale:	string;
 *  image:	string;
 *  orderNum:	number;
 *  url:	string;
 * }} assetObj
 *
 * @returns
 */
export function updateAsset(assetObj) {
  return request({
    url: "/asset/"+assetObj.id,
    headers: {
      isToken: true,
    },
    method: "patch",
    data: assetObj,
  });
}

/**
 * 查询Asset列表
 *
 * @param {{
 *    pageNum?: number; // 当前页
 *    pageSize?: number; // 每页条数
 *    position:	string;
 *    scale:	string;
 *    url:	string;
 * }} params
 * @returns
 */
export function getAssetList(params) {
  return request({
    url: "/market/asset/flow",
    method: "get",
    params,
  });
}

/**
 * 查询Asset详情
 *
 * @param {string | number} id
 * @returns
 */
export function getAssetDetailsById(id) {
  return request({
    url: "/asset/" + id,
    method: "get",
  });
}

/**
 * 批量删除Asset
 *
 * @param {string} ids 要删除的Assetids
 * @returns
 */
export function deleteAssetByIds(ids) {
  return request({
    url: "/asset/" + ids,
    method: "delete",
  });
}
