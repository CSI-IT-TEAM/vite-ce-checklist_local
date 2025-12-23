import { callProcedureAPI } from './base';

// ============ AUTH/LOGIN API ============

export interface LoginData {
    cardNumber: string;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    data?: {
        OUT_CURSOR?: any[];
    };
}

/**
 * Login sử dụng PKG_CE_CHECKLIST_WEB.SELECT_COMBO với QR_INFOR
 */
export const loginWithCard = async (
    cardNumber: string
): Promise<LoginResponse> => {
    const endpoint = "https://vjweb.dskorea.com:9091/api/call-procedure";

    const payload = {
        dbName: "LMES",
        packageName: "PKG_GA_SYSTEM_REQUEST",
        procedureName: "SMT_DOWNLOAD",
        params: {
            ARG_TYPE: {
                value: "LOGIN",
                type: "IN"
            },
            ARG_EMPID: {
                value: cardNumber,
                type: "IN"
            },
            OUT_CURSOR: {
                type: "OUT",
                dataType: "CURSOR"
            }
        }
    };

    return callProcedureAPI(payload, endpoint);
};
