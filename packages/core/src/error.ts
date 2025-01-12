import { JOSEError } from "jose/errors"

export type AuthErrorCode =
    | "unknown_url"
    | "oauth_error"
    | "unknown_provider"
    | "invalid_request"
    | "unknown_error"
    | "unknown_authentication_error"
    | "json_web_token_error"


export class AuthError extends Error {
    status: number
    code: AuthErrorCode
    constructor(code: AuthErrorCode, message: string, status: number = 500, cause?: unknown) {
        super(`Authentication Error: ${code} (${status}) - ${message}`)
        this.code = code
        this.status = status
        this.cause = cause
    }
}

export function catch_error<T>(fn: () => T): T {
    try {
        return fn()
    } catch (e) {
        if (e instanceof AuthError) throw e
        if (e instanceof JOSEError) throw new AuthError("json_web_token_error", e.name, 500, e)
        if (e instanceof Error) throw new AuthError("unknown_authentication_error", e.message, 500, e)
        throw new AuthError("unknown_authentication_error", "An unknown error occurred", 500, e)
    }
}