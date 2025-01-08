import { Provider } from "@lumina-auth/core";

export interface GoogleRequest {
    callback: string
}

export interface GoogleResponse {
    redirect_uri: string
}

export interface GoogleProfile {
    sub: string
    email: string
    email_verified: boolean
    name: string
    picture: string
    locale: string
}

export interface GooogleAuthResponse {
    access_token: string
    id_token: string
    scope: string
    expires_in: number
    first_issued_at: number
    expires_at: number
}

declare global {
    namespace LuminaAuth {
        interface ProviderProfileMap {
            google: {
                id: string
                email: string
                name: string
            }
        }
    }
}

export class GoogleProvider extends Provider<GoogleProfile, GoogleRequest, GoogleResponse> {
    constructor() {
        super()
    }

    handle(request: GoogleRequest): Promise<GoogleResponse> {
        throw new Error("Not implemented")
    }
}
