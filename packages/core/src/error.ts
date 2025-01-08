export type AuthErrorCode =
    | "unknown_url"
    | "unknown_provider"
    | "invalid_request"


export class AuthError extends Error {
    status: number
    code: AuthErrorCode
    constructor(code: AuthErrorCode, message: string, status: number = 500) {
        super(`${code} (${status}): ${message}`)
        this.code = code
        this.status = status
    }
}
