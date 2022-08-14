import request from "@/utils/request";

/**
 * 新增Banner
 *
 * @param {{
 *  desc?:	string;
 *  position:	string;
 *  scale:	string;
 *  image:	string;
 *  orderNum:	number;
 *  url?:	string;
 * }} bannerObj
 *
 * @returns
 */
export function addBanner(bannerObj) {
  return request({
    url: "/banner",
    headers: {
      isToken: true,
    },
    method: "post",
    data: bannerObj,
  });
}

/**
 * 更新Banner
 * @param {{
 *  id:	string;
 *  desc?:	string;
 *  position:	string;
 *  scale:	string;
 *  image:	string;
 *  orderNum:	number;
 *  url:	string;
 * }} bannerObj
 *
 * @returns
 */
export function updateBanner(bannerObj) {
  return request({
    url: "/banner/"+bannerObj.id,
    headers: {
      isToken: true,
    },
    method: "patch",
    data: bannerObj,
  });
}

/**
 * 查询Banner列表
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
export function getBannerList(params) {
  return request({
    url: "/banner",
    method: "get",
    params,
  });
}

/**
 * 查询Banner详情
 *
 * @param {string | number} id
 * @returns
 */
export function getBannerDetailsById(id) {
  return request({
    url: "/banner/" + id,
    method: "get",
  });
}

/**
 * 批量删除Banner
 *
 * @param {string} ids 要删除的Bannerids
 * @returns
 */
export function deleteBannerByIds(ids) {
  return request({
    url: "/banner/" + ids,
    method: "delete",
  });
}
