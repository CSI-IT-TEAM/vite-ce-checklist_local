// ============ COMBO DATA API ============

export type ComboType =
    | 'CBO_FAC'         // Factory/Area combo
    | 'CBO_PLANT'       // Plant combo
    | 'CBO_LINE'        // Line combo
    | 'CBO_PROCESS'     // Process combo
    | 'CBO_MACHINE'     // Machine combo
    | 'QR_INFOR';       // QR Information

export interface ComboItem {
    CODE?: string;
    NAME?: string;
    [key: string]: any;
}

export interface ComboResponse {
    success: boolean;
    message?: string;
    data?: {
        OUT_CURSOR?: ComboItem[];
    };
}

export interface ComboParams {
    condition1?: string;
    condition2?: string;
    condition3?: string;
    condition4?: string;
}

/**
 * Lấy dữ liệu combo sử dụng PKG_CE_CHECKLIST_WEB.SELECT_COMBO
 */
export const getComboData = async (
    comboType: ComboType,
    params?: ComboParams
): Promise<ComboResponse> => {
    const endpoint = "https://vjweb.dskorea.com:9091/api/call-procedure";

    const payload = {
        dbName: "LMES",
        packageName: "PKG_CE_CHECKLIST_WEB",
        procedureName: "SELECT_COMBO",
        params: {
            ARG_QTYPE: {
                value: comboType,
                type: "IN"
            },
            ARG_CONDITION1: {
                value: params?.condition1 || "",
                type: "IN"
            },
            ARG_CONDITION2: {
                value: params?.condition2 || "",
                type: "IN"
            },
            ARG_CONDITION3: {
                value: params?.condition3 || "",
                type: "IN"
            },
            ARG_CONDITION4: {
                value: params?.condition4 || "",
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

        return (await res.json()) as ComboResponse;
    } catch (error: any) {
        return { success: false, message: error.message || "Network error" };
    }
};
