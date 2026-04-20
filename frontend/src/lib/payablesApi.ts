export type PayablesUser = { uid: string; token: string };

export type PayablesRole = "owner" | "admin" | "approver" | "member" | "viewer";

export interface PayablesWorkspace {
  uid: string;
  name: string;
  role: PayablesRole;
}

export function getPayablesWorkspaceUid(userUid: string) {
  if (typeof window === "undefined") return userUid;
  return window.localStorage.getItem("payables_workspace_uid") || userUid;
}

export function setPayablesWorkspaceUid(workspaceUid: string) {
  if (typeof window !== "undefined" && workspaceUid) {
    window.localStorage.setItem("payables_workspace_uid", workspaceUid);
  }
}

export function clearPayablesWorkspaceUid() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("payables_workspace_uid");
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

export function canManage(role: PayablesRole | null) {
  return role === "owner" || role === "admin";
}

export function canApprove(role: PayablesRole | null) {
  return role === "owner" || role === "admin" || role === "approver";
}

export function isReadOnly(role: PayablesRole | null) {
  return role === "viewer";
}

export const ROLE_LABELS: Record<PayablesRole, string> = {
  owner: "Owner",
  admin: "Admin",
  approver: "Approver",
  member: "Member",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<PayablesRole, string> = {
  owner: "Full control over the workspace",
  admin: "Manage workspace, members, and invoices",
  approver: "Review and approve assigned invoices",
  member: "Submit and view invoices",
  viewer: "Read-only access to invoices and reports",
};
