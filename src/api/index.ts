// ============ API INDEX ============
// Export tất cả API functions từ một nơi

// Config
export {
    API_ENDPOINTS,
    DB_CONFIG,
    PACKAGE_NAMES,
    PROCEDURE_NAMES,
    DEFAULT_HEADERS
} from './config';

// Base API
export {
    callProcedureAPI,
    saveProcedureAPI,
    fetchAPI,
    type ProcedurePayload,
    type ProcedureResponse,
    type SaveProcedurePayload,
    type SaveProcedureResponse
} from './base';

// Helpers
export {
    removeVietnameseDiacritics,
    encodeBase64,
    decodeBase64
} from './helpers';

// Auth/Login API
export {
    loginWithCard,
    getEmployeeInfo,
    type LoginData,
    type LoginResponse,
    type EmployeeInfo,
    type EmployeeInfoResponse
} from './auth';

// Combo/Dropdown API
export {
    getComboData,
    type ComboType,
    type ComboItem,
    type ComboResponse,
    type ComboParams
} from './combo';

// Checklist Save API
export {
    saveChecklistData,
    type ChecklistSaveData,
    type ChecklistSaveResponse
} from './checklist';

// History API
export {
    getHistoryData,
    type HistoryParams,
    type HistoryItem,
    type HistoryResponse
} from './history';
