import { API_ENDPOINTS, DEFAULT_HEADERS } from './config';

// ============ BASE API TYPES ============

export interface ProcedurePayload {
    [key: string]: any;
}

export interface ProcedureResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    [key: string]: any;
}

export interface SaveProcedurePayload {
    dbName: string;
    packageName: string;
    procedureName: string;
    params: {
        [key: string]: {
            value: string;
            type: "IN" | "OUT";
            dataType?: string;
        };
    };
}

export interface SaveProcedureResponse {
    success: boolean;
    data?: {
        message?: string;
        [key: string]: any;
    };
    message?: string;
    [key: string]: any;
}

// ============ BASE API FUNCTIONS ============

/**
 * Gọi procedure API (POST method)
 * @param payload - Dữ liệu gửi đi
 * @param customEndpoint - Endpoint tùy chỉnh (mặc định: /api/call-procedure)
 */
export const callProcedureAPI = async <T = any>(
    payload: ProcedurePayload,
    customEndpoint?: string
): Promise<ProcedureResponse<T>> => {
    const endpoint = customEndpoint || API_ENDPOINTS.CALL_PROCEDURE;

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            return { success: false, message: `HTTP ERROR ${res.status}` };
        }

        return (await res.json()) as ProcedureResponse<T>;
    } catch (error: any) {
        return { success: false, message: error.message || "Network error" };
    }
};

/**
 * Gọi save procedure API (PUT method)
 * @param payload - Dữ liệu gửi đi
 * @param customEndpoint - Endpoint tùy chỉnh (mặc định: /api/save-procedure)
 */
export const saveProcedureAPI = async (
    payload: SaveProcedurePayload,
    customEndpoint?: string
): Promise<SaveProcedureResponse> => {
    const endpoint = customEndpoint || API_ENDPOINTS.SAVE_PROCEDURE;

    try {
        const res = await fetch(endpoint, {
            method: "PUT",
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            return { success: false, message: `HTTP ERROR ${res.status}` };
        }

        return (await res.json()) as SaveProcedureResponse;
    } catch (error: any) {
        return { success: false, message: error.message || "Network error" };
    }
};

/**
 * Generic fetch wrapper với error handling
 * @param endpoint - API endpoint
 * @param options - Fetch options
 */
export const fetchAPI = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> => {
    try {
        const res = await fetch(endpoint, {
            headers: DEFAULT_HEADERS,
            ...options,
        });

        if (!res.ok) {
            const errorText = await res.text();
            return { success: false, message: `HTTP ERROR ${res.status}: ${errorText}` };
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error: any) {
        return { success: false, message: error.message || "Network error" };
    }
};
