export function isNullOrEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true;

    // string: "", "   "
    if (typeof value === "string" && value.trim() === "") return true;

    // array: []
    if (Array.isArray(value) && value.length === 0) return true;

    // object: {}
    if (
        typeof value === "object" &&
        value !== null &&
        Object.keys(value).length === 0
    ) {
        return true;
    }

    return false;
}
