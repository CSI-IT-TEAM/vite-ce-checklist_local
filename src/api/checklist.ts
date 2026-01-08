import { saveProcedureAPI } from './base';
import { DB_CONFIG, PACKAGE_NAMES } from './config';
import { removeVietnameseDiacritics, encodeBase64 } from './helpers';

// ============ CHECKLIST SAVE API ============

export interface ChecklistSaveData {
    qtype?: string;
    barcode: string;
    empId: string;
    empName: string;
    deptId?: string;
    deptName: string;
    locate: string;         // LOWER, MIDDLE, UPPER
    div: string;            // L, R (Left/Right)
    checkStatus: string;    // OK, NG
    checkValues: number | string;
    remarks?: string;
    settingValues: number | string;
    displayValues: number | string;
}

export interface ChecklistSaveResponse {
    success: boolean;
    message?: string;
    data?: any;
}

/**
 * Lưu dữ liệu checklist sử dụng PKG_CE_CHECKLIST_WEB.SAVE_DATA_CHECKLIST
 * - Tự động loại bỏ dấu tiếng Việt khỏi remarks
 * - Tự động encode remarks thành base64
 * @param data - Dữ liệu checklist cần lưu
 */
export const saveChecklistData = async (
    data: ChecklistSaveData
): Promise<ChecklistSaveResponse> => {
    // Process remarks: 
    // - ARG_REMARKS: loại bỏ dấu tiếng Việt
    // - ARG_REMARKS_BASE64: remark nguyên mẫu encode base64
    const remarksNoDiacritics = removeVietnameseDiacritics(data.remarks || '');
    const remarksBase64 = encodeBase64(data.remarks || '');

    const payload = {
        dbName: DB_CONFIG.DB_NAME,
        packageName: PACKAGE_NAMES.CE_CHECKLIST_WEB,
        procedureName: "SAVE_DATA_CHECKLIST",
        params: {
            ARG_QTYPE: {
                value: data.qtype || "SAVE",
                type: "IN" as const
            },
            ARG_BARCODE: {
                value: data.barcode || "",
                type: "IN" as const
            },
            ARG_EMP_ID: {
                value: data.empId || "",
                type: "IN" as const
            },
            ARG_EMP_NM: {
                value: data.empName || "",
                type: "IN" as const
            },
            ARG_DEPT_ID: {
                value: data.deptId || "",
                type: "IN" as const
            },
            ARG_DEPT_NM: {
                value: data.deptName || "",
                type: "IN" as const
            },
            ARG_LOCATE: {
                value: data.locate || "",
                type: "IN" as const
            },
            ARG_DIV: {
                value: data.div || "",
                type: "IN" as const
            },
            ARG_CHECK_STATUS: {
                value: data.checkStatus || "",
                type: "IN" as const
            },
            ARG_CHECK_VALUES: {
                value: String(data.checkValues || 0),
                type: "IN" as const
            },
            ARG_REMARKS: {
                value: remarksNoDiacritics,
                type: "IN" as const
            },
            ARG_REMARKS_BASE64: {
                value: remarksBase64,
                type: "IN" as const
            },
            ARG_SETTING_VALUES: {
                value: String(data.settingValues || 0),
                type: "IN" as const
            },
            ARG_DISPLAY_VALUES: {
                value: String(data.displayValues || 0),
                type: "IN" as const
            }
        }
    };

    try {
        const result = await saveProcedureAPI(payload);
        return result as ChecklistSaveResponse;
    } catch (error: any) {
        console.error('Save error:', error);
        return { success: false, message: error.message || "Network error" };
    }
};
