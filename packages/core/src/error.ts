import { JOSEError } from "jose/errors"

export { JOSEError }

export class AuthError extends Error {
    status: number
    message: string
    code: string
    cause?: unknown
    constructor(code: string, message: string, status: number = 500, cause?: unknown) {
        super(`Authentication: ${code} (${status}) - ${message}`, { cause })
        this.code = code
        this.status = status
        this.message = message
        this.cause = cause
    }
}

export function convert_error(e: unknown): AuthError {
    if (e instanceof AuthError) return e
    if (e instanceof Error) return new AuthError(e.name, e.message, 400, e)
    throw e
}
