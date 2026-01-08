import { callProcedureAPI } from './base';
import { API_ENDPOINTS, DB_CONFIG, PACKAGE_NAMES, PROCEDURE_NAMES, DEFAULT_HEADERS } from './config';

// ============ AUTH/LOGIN API ============

export interface LoginData {
    cardNumber: string;
}

export interface EmployeeInfo {
    EMP_ID: string;
    EMP_NAME: string;
    NAME_ENG: string;
    DEPT: string;
    DEPT_NM: string;
    JOBCD: string;
    JOBCD_NM: string;
    JOB_POSITION: string;
    JOB_POSITION_NM: string;
    PHONE: string;
    EMAIL: string;
    PHOTO_URL?: string;
    PHOTO?: string;
    IP_ADDRESS: string;
    COMPANY: string;
    SERVICE_ID: string;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    data?: {
        OUT_CURSOR?: EmployeeInfo[];
    };
}

export interface EmployeeInfoResponse {
    success: boolean;
    message?: string;
    data?: {
        OUT_CURSOR?: EmployeeInfo[];
    };
}

/**
 * Login sử dụng PKG_GA_SYSTEM_REQUEST.SMT_DOWNLOAD
 * @deprecated Sử dụng getEmployeeInfo thay thế
 */
export const loginWithCard = async (
    cardNumber: string
): Promise<LoginResponse> => {
    const payload = {
        dbName: DB_CONFIG.DB_NAME,
        packageName: PACKAGE_NAMES.GA_SYSTEM_REQUEST,
        procedureName: PROCEDURE_NAMES.SMT_DOWNLOAD,
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

    return callProcedureAPI(payload);
};

/**
 * Lấy thông tin nhân viên qua /api/common/employee-info
 * Đây là API được sử dụng bởi LoginLocal
 */
export const getEmployeeInfo = async (
    empId: string,
    serviceId: string = "VJ",
    langCd: string = "ENG"
): Promise<EmployeeInfoResponse> => {
    try {
        const res = await fetch(API_ENDPOINTS.EMPLOYEE_INFO, {
            method: "POST",
            headers: DEFAULT_HEADERS,
            body: JSON.stringify({
                serviceId,
                langCd,
                empId
            })
        });

        if (!res.ok) {
            return { success: false, message: `HTTP ERROR ${res.status}` };
        }

        return (await res.json()) as EmployeeInfoResponse;
    } catch (error: any) {
        return { success: false, message: error.message || "Network error" };
    }
};
