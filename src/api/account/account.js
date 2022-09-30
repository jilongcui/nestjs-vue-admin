import request from "@/utils/request";

/**
 * 查询提现列表
 *
 * @param {{
 *    type: "1" | "2" | "3"; // 类型 1:银行卡 2:微信 3:支付宝
 *    minUsable: string | number;
 *    minFreeze: string | number;
 *    userId: string | number;
 *    pageNum?: number; // 当前页
 *    pageSize?: number; // 每页条数
 *    withdrawByColumn?: string; // 排序字段
 *    isAsc?: string; // 排序方式
 *    status?: '0' | '1' | '2'; // 账户状态 0: 未认证 1: 正常 2:冻结
 * }} params
 * @returns
 */
export function getAccountList(params) {
    return request({
        url: "/account/list",
        method: "get",
        params,
    });
}

/**
 * 冻结账户
 * @param {string | number} accountId
 * @returns
 */
export function freezeAccount(accountId) {
    return request({
        url: "/account/" + accountId + "/freeze",
        method: "put",
        headers: {
            isToken: true,
        },
    });
}

/**
 * 解除冻结
 *
 * @param {string | number} accountId
 * @returns
 */
export function releaseAccount(accountId) {
    return request({
        url: "/account/" + accountId + "/release",
        method: "put",
        headers: {
            isToken: true,
        },
    });
}
