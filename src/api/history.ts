import { decodeBase64 } from './helpers';

// ============ HISTORY DATA API ============

export interface HistoryParams {
    qtype?: string;     // Default 'Q'
    ymdf: string;       // From date (YYYYMMDD)
    ymdt: string;       // To date (YYYYMMDD)
    fac: string;        // Factory/Area
    plant: string;      // Plant
    line: string;       // Line
    opcd: string;       // Process/Operation code
    machine: string;    // Machine
}

export interface HistoryResponse {
    success: boolean;
    message?: string;
    data?: {
        OUT_CURSOR?: any[];
    };
}

/**
 * Lấy dữ liệu lịch sử sử dụng PKG_CE_CHECKLIST_WEB.GET_DATA_HISTORY
 */
export const getHistoryData = async (
    params: HistoryParams
): Promise<HistoryResponse> => {
    const endpoint = "https://vjweb.dskorea.com:9091/api/call-procedure";

    const payload = {
        dbName: "LMES",
        packageName: "PKG_CE_CHECKLIST_WEB",
        procedureName: "GET_DATA_HISTORY",
        params: {
            ARG_QTYPE: {
                value: params.qtype || "Q",
                type: "IN"
            },
            ARG_YMDF: {
                value: params.ymdf || "",
                type: "IN"
            },
            ARG_YMDT: {
                value: params.ymdt || "",
                type: "IN"
            },
            ARG_FAC: {
                value: params.fac || "",
                type: "IN"
            },
            ARG_PLANT: {
                value: params.plant || "",
                type: "IN"
            },
            ARG_LINE: {
                value: params.line || "",
                type: "IN"
            },
            ARG_OPCD: {
                value: params.opcd || "",
                type: "IN"
            },
            ARG_MACHINE: {
                value: params.machine || "",
                type: "IN"
            },
            OUT_CURSOR: {
                type: "OUT",
                dataType: "CURSOR"
            }
        }
    };

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json"
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            return { success: false, message: `HTTP ERROR ${res.status}` };
        }

        const result = await res.json();

        // Decode ISSUE from base64 nếu có
        if (result?.success && result?.data?.OUT_CURSOR) {
            result.data.OUT_CURSOR = result.data.OUT_CURSOR.map((item: any) => ({
                ...item,
                // Decode ISSUE từ base64 nếu có
                ISSUE: item.ISSUE ? decodeBase64(item.ISSUE) : ''
            }));
        }

        return result as HistoryResponse;
    } catch (error: any) {
        console.error('History error:', error);
        return { success: false, message: error.message || "Network error" };
    }
};
