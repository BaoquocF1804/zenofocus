// UUID generator that works in both HTTP and HTTPS contexts
export function generateUUID(): string {
    // Try to use crypto.randomUUID if available (HTTPS/localhost)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback for HTTP contexts - RFC4122 version 4 UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
