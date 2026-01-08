// ============ API CONFIGURATION ============
// Tập trung tất cả cấu hình API tại một nơi

/**
 * Base URL cho API
 * - Development: Sử dụng đường dẫn tương đối (qua Vite proxy)
 * - Production: Sử dụng URL đầy đủ
 */
const isDevelopment = import.meta.env.DEV;

// API Server URL
const API_SERVER = 'https://vjweb.dskorea.com:9091';

/**
 * Lấy URL đầy đủ cho endpoint
 * @param path - Đường dẫn API (ví dụ: '/api/call-procedure')
 */
const getApiUrl = (path: string): string => {
    if (isDevelopment) {
        // Development: Sử dụng proxy
        return path;
    }
    // Production: Sử dụng URL đầy đủ
    return `${API_SERVER}${path}`;
};

/**
 * API Endpoints
 * Sử dụng đường dẫn tương đối trong development (Vite proxy)
 * Sử dụng URL đầy đủ trong production
 */
export const API_ENDPOINTS = {
    // Base endpoints
    get CALL_PROCEDURE() { return getApiUrl('/api/call-procedure'); },
    get SAVE_PROCEDURE() { return getApiUrl('/api/save-procedure'); },

    // Auth endpoints
    get EMPLOYEE_INFO() { return getApiUrl('/api/common/employee-info'); },
} as const;

/**
 * Database config
 */
export const DB_CONFIG = {
    DB_NAME: 'LMES',
} as const;

/**
 * Package names
 */
export const PACKAGE_NAMES = {
    CE_CHECKLIST_WEB: 'PKG_CE_CHECKLIST_WEB',
    GA_SYSTEM_REQUEST: 'PKG_GA_SYSTEM_REQUEST',
} as const;

/**
 * Procedure names
 */
export const PROCEDURE_NAMES = {
    SELECT_COMBO: 'SELECT_COMBO',
    SAVE_DATA_CHECKLIST: 'SAVE_DATA_CHECKLIST',
    GET_DATA_HISTORY: 'GET_DATA_HISTORY',
    SMT_DOWNLOAD: 'SMT_DOWNLOAD',
} as const;

/**
 * Default request headers
 */
export const DEFAULT_HEADERS: Record<string, string> = {
    'Content-Type': 'application/json',
    'accept': 'application/json',
};

/**
 * Export cho việc kiểm tra môi trường
 */
export const ENV = {
    isDevelopment,
    API_SERVER,
};
