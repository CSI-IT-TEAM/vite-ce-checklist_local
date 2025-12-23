export interface SCommonPayload {
  QueryType: "CALL_PROCEDURE" | "SAVE_PROCEDURE";
  ProcedureName: string;
  userDatas: Record<string, any>;
  user_appname: "Web" | "Mobile";
  timestamp: string;
  deviceName: string;
}

export function createSCommonPayload(
  queryType: "CALL_PROCEDURE" | "SAVE_PROCEDURE",
  procedureName: string,
  params: Record<string, any>,
  appName: "Web" | "Mobile" = "Mobile",
  deviceName?: string
): SCommonPayload {

  if (!procedureName || procedureName.trim() === "") {
    throw new Error("ProcedureName is required.");
  }

  if (!params || typeof params !== "object") {
    throw new Error("userDatas must be an object.");
  }

  return {
    QueryType: queryType,
    ProcedureName: procedureName,
    userDatas: params,
    user_appname: appName,
    timestamp: new Date().toISOString(), // gửi UTC
    deviceName: deviceName || (typeof navigator !== "undefined" ? navigator.userAgent : "Unknown")
  };
}
