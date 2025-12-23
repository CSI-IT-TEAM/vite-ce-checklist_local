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
 */
export const saveChecklistData = async (
    data: ChecklistSaveData
): Promise<ChecklistSaveResponse> => {
    const endpoint = "https://vjweb.dskorea.com:9091/api/save-procedure";

    // Process remarks: 
    // - ARG_REMARKS: loại bỏ dấu tiếng Việt
    // - ARG_REMARKS_BASE64: remark nguyên mẫu encode base64
    const remarksNoDiacritics = removeVietnameseDiacritics(data.remarks || '');
    const remarksBase64 = encodeBase64(data.remarks || '');

    const payload = {
        dbName: "LMES",
        packageName: "PKG_CE_CHECKLIST_WEB",
        procedureName: "SAVE_DATA_CHECKLIST",
        params: {
            ARG_QTYPE: {
                value: data.qtype || "SAVE",
                type: "IN"
            },
            ARG_BARCODE: {
                value: data.barcode || "",
                type: "IN"
            },
            ARG_EMP_ID: {
                value: data.empId || "",
                type: "IN"
            },
            ARG_EMP_NM: {
                value: data.empName || "",
                type: "IN"
            },
            ARG_DEPT_ID: {
                value: data.deptId || "",
                type: "IN"
            },
            ARG_DEPT_NM: {
                value: data.deptName || "",
                type: "IN"
            },
            ARG_LOCATE: {
                value: data.locate || "",
                type: "IN"
            },
            ARG_DIV: {
                value: data.div || "",
                type: "IN"
            },
            ARG_CHECK_STATUS: {
                value: data.checkStatus || "",
                type: "IN"
            },
            ARG_CHECK_VALUES: {
                value: String(data.checkValues || 0),
                type: "IN"
            },
            ARG_REMARKS: {
                value: remarksNoDiacritics,
                type: "IN"
            },
            ARG_REMARKS_BASE64: {
                value: remarksBase64,
                type: "IN"
            },
            ARG_SETTING_VALUES: {
                value: String(data.settingValues || 0),
                type: "IN"
            },
            ARG_DISPLAY_VALUES: {
                value: String(data.displayValues || 0),
                type: "IN"
            }
        }
    };

    try {
        const res = await fetch(endpoint, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json"
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorText = await res.text();
            return { success: false, message: `HTTP ERROR ${res.status}: ${errorText}` };
        }

        const result = await res.json();
        return result as ChecklistSaveResponse;
    } catch (error: any) {
        console.error('Save error:', error);
        return { success: false, message: error.message || "Network error" };
    }
};
