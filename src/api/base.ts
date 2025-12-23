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
 */
export const callProcedureAPI = async <T = any>(
    payload: ProcedurePayload,
    customEndpoint?: string
): Promise<ProcedureResponse<T>> => {
    const endpoint = customEndpoint || "https://vjweb.dskorea.com:9091/api/call-procedure";

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

        return (await res.json()) as ProcedureResponse<T>;
    } catch (error: any) {
        return { success: false, message: error.message || "Network error" };
    }
};

/**
 * Gọi save procedure API (PUT method)
 */
export const saveProcedureAPI = async (
    payload: SaveProcedurePayload,
    customEndpoint?: string
): Promise<SaveProcedureResponse> => {
    const endpoint = customEndpoint || "https://vjweb.dskorea.com:9091/api/save-procedure";

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
            return { success: false, message: `HTTP ERROR ${res.status}` };
        }

        return (await res.json()) as SaveProcedureResponse;
    } catch (error: any) {
        return { success: false, message: error.message || "Network error" };
    }
};
