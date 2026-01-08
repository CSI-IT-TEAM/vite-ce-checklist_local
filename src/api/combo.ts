import { callProcedureAPI } from './base';
import { DB_CONFIG, PACKAGE_NAMES } from './config';

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
 * @param comboType - Loại combo cần lấy
 * @param params - Các điều kiện lọc
 */
export const getComboData = async (
    comboType: ComboType,
    params?: ComboParams
): Promise<ComboResponse> => {
    const payload = {
        dbName: DB_CONFIG.DB_NAME,
        packageName: PACKAGE_NAMES.CE_CHECKLIST_WEB,
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

    return callProcedureAPI(payload);
};
