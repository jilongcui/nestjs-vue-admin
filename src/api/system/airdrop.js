import request, { download } from "@/utils/request";

/**
 * 新增Airdrop
 *
 * @param {{
 *  collectionId:	number;
 *  desc:	string;
 *  needClaim:	boolean;
 *  status:	string;
 * }} airdropObj
 *
 * @returns
 */
export function addAirdrop(airdropObj) {
  return request({
    url: "/airdrop",
    headers: {
      isToken: true,
    },
    method: "post",
    data: airdropObj,
  });
}

/**
 * 更新Airdrop
 * @param {{
 *  collectionId:	number;
 *  desc:	string;
 *  needClaim:	boolean;
 *  status:	string;
 * }} airdropObj
 *
 * @returns
 */
export function updateAirdrop(airdropObj) {
  return request({
    url: "/airdrop/" + airdropObj.id,
    headers: {
      isToken: true,
    },
    method: "patch",
    data: airdropObj,
  });
}

/**
 * 查询Airdrop列表
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
export function getAirdropList(params) {
  return request({
    url: "/airdrop/list",
    method: "get",
    params,
  });
}

/**
 * 查询Airdrop详情
 *
 * @param {string | number} id
 * @returns
 */
export function getAirdropDetailsById(id) {
  return request({
    url: "/airdrop/" + id,
    method: "get",
  });
}

/**
 * 删除Airdrop
 *
 * @param {string} id 要删除的Airdropid
 * @returns
 */
export function deleteAirdropByIds(id) {
  return request({
    url: "/airdrop/" + id,
    method: "delete",
  });
}

/**
 * 新增AirdropWhitelist
 *
 * @param {{
 * "collectionId": 0,
 * "userId": 0,
 * "status": "string",
 * "tx": "string",
 * "chainId": 0
 * }} data
 *
 * @returns
 */
export function addAirdropWhitelist(data) {
  return request({
    url: "/airdropWhitelist",
    headers: {
      isToken: true,
    },
    method: "post",
    data,
  });
}

/**
 * 更新AirdropWhitelist
 * @param {{
 * "collectionId": 0,
 * "userId": 0,
 * "status": "string",
 * "tx": "string",
 * "chainId": 0
 * }} data
 *
 * @returns
 */
export function updateAirdropWhitelist(data) {
  return request({
    url: "/airdropWhitelist/" + data.id,
    headers: {
      isToken: true,
    },
    method: "patch",
    data,
  });
}

/**
 * 查询Airdrop白名单列表
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
export function getAirdropWhiteList(params) {
  return request({
    url: "/airdropWhitelist/list",
    method: "get",
    params,
  });
}

/**
 * 查询Airdrop白名单详情
 *
 * @param {string | number} id
 * @returns
 */
export function getAirdropWhitelistDetailsById(id) {
  return request({
    url: "/airdropWhitelist/" + id,
    method: "get",
  });
}

/**
 * 删除Airdrop
 *
 * @param {string} id 要删除的Airdropid
 * @returns
 */
export function deleteAirdropWhitelistById(id) {
  return request({
    url: "/airdropWhitelist/" + id,
    method: "delete",
  });
}

/**
 * 下载模版
 * @returns
 */
export function downloadExcelTemp() {
  return download("/airdropWhitelist/importTemplate", {}, "白名单模版.csv");
}

/**
 * 导入空投白名单数据
 * @param {*} file
 * @returns
 */
export function importWhitelistDataFromFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  return request({
    url: "/airdropWhitelist/importData",
    method: "post",
    data: formData,
  });
}

/**
 * 导出空投白名单数据
 * @returns
 */
export function exportWhitelistData() {
  return download("/airdropWhitelist/export", {}, "空投白名单.csv");
}
