import request from "@/utils/request";

export function getDashboardSummary() {
  return request({ url: "/dashboard/summary", method: "get" });
}

export function getDashboardDailyTrend(days) {
  return request({ url: "/dashboard/daily-trend", method: "get", params: { days: days || 30 } });
}

export function getLearningSummary() {
  return request({ url: "/dashboard/learning-summary", method: "get" });
}

export function getLearningTrend(days) {
  return request({ url: "/dashboard/learning-trend", method: "get", params: { days: days || 30 } });
}
