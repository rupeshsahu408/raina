export type PayablesUser = { uid: string; token: string };

export function getPayablesWorkspaceUid(userUid: string) {
  if (typeof window === "undefined") return userUid;
  return window.localStorage.getItem("payables_workspace_uid") || userUid;
}

export function setPayablesWorkspaceUid(workspaceUid: string) {
  if (typeof window !== "undefined" && workspaceUid) {
    window.localStorage.setItem("payables_workspace_uid", workspaceUid);
  }
}

export function payablesHeaders(user: PayablesUser, json = false): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${user.token}`,
    "x-uid": user.uid,
    "x-payables-workspace-uid": getPayablesWorkspaceUid(user.uid),
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}
