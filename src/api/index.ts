// ============ API INDEX ============
// Export tất cả API functions từ một nơi

// Base API
export {
    callProcedureAPI,
    saveProcedureAPI,
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
    type LoginData,
    type LoginResponse
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
    type HistoryResponse
} from './history';
