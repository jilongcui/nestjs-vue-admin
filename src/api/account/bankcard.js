import request from "@/utils/request";

/**
 * 查询银行卡列表
 *
 * @param {{
 *    cardNo: string;    // 持卡人银行卡号
 *    mobile: string;    // 持卡人预留手机号
 *    bankName: string;  // 银行名称
 *    cardType: string;  // 银行卡类型 0: 储蓄卡 1: 信用卡
 *    bankType: string;  // 银行类型: 只用于展示图标用途
 *    userId: string | number;
 *    pageNum?: number; // 当前页
 *    pageSize?: number; // 每页条数
 *    withdrawByColumn?: string; // 排序字段
 *    isAsc?: string; // 排序方式
 *    status?: '0' | '1' | '2' | '3' | '4'; // 签约状态 0: 未签约 1: 已经签约 2:签约失败 3: 已经鉴权 4: 鉴权失败
 * }} params
 * @returns
 */
export function getBankcardList(params) {
    return request({
        url: "/bankcard/list",
        method: "get",
        params,
    });
}

/**
 * 失效银行卡
 * @param {string | number} accountId
 * @returns
 */
export function invalidateBankcard(accountId) {
    return request({
        url: "/bankcard/" + accountId + "/invalidate",
        method: "put",
        headers: {
            isToken: true,
        },
    });
}

/**
 * 鉴权银行卡
 * @param {string | number} accountId
 * @returns
 */
export function verifyBankcard(accountId) {
    return request({
        url: "/fund/" + "/invalidate",
        method: "Post",
        headers: {
            isToken: true,
        },
        data: {
            accountId,
        },
    });
}
