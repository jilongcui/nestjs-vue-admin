import request from "@/utils/request";

// === 面试课程 ===
export function listInterview(query) {
  return request({ url: "/sys/interviews", method: "get", params: query });
}
export function getInterview(id) {
  return request({ url: "/sys/interviews/" + id, method: "get" });
}
export function updateInterview(id, data) {
  return request({ url: "/sys/interviews/" + id, method: "patch", data });
}

// === 行测课程 ===
export function listQuestion(query) {
  return request({ url: "/sys/questions", method: "get", params: query });
}
export function getQuestion(id) {
  return request({ url: "/sys/questions/" + id, method: "get" });
}
export function updateQuestion(id, data) {
  return request({ url: "/sys/questions/" + id, method: "patch", data });
}

// === 申论课程 ===
export function listDiscussion(query) {
  return request({ url: "/sys/discussions", method: "get", params: query });
}
export function getDiscussion(id) {
  return request({ url: "/sys/discussions/" + id, method: "get" });
}
export function updateDiscussion(id, data) {
  return request({ url: "/sys/discussions/" + id, method: "patch", data });
}
