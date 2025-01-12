import { AuthError } from "@lumina-auth/core"
import { Provider } from "@lumina-auth/core"
import type { AuthEventData, AuthResult } from "@lumina-auth/core"

export interface GoogleProfile {
    id: string
    email: string
    verified_email: boolean
    name: string
    given_name: string
    family_name: string
    picture: string
}

// export interface GoogleSigninOptions {
//     scopes?: string[]
// }

declare global {
    namespace LuminaAuth {
        interface ProviderProfiles {
            google: GoogleProfile
        }

        interface ProviderSigninOptions {
            // google?: GoogleSigninOptions
        }
    }
}

export function GoogleProvider(
    options: {
        client_id: string
        client_secret: string
        scopes?: string[]
    }
): Provider<"google"> {

    async function build_auth_url({
        auth_system, build_url 
    }: AuthEventData) {
        const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")

        const state_jwt = auth_system.create_jwt({
            sub: crypto.randomUUID(),
            type: "google_state",
        }).setExpirationTime("15m")

        const state = await auth_system.sign_jwt(state_jwt)

        const params = new URLSearchParams({
            client_id: options.client_id,
            scope: options.scopes ? options.scopes.join(" ") : "openid email profile",
            include_granted_scopes: "true",
            response_type: "code",
            prompt: "consent",
            redirect_uri: build_url("callback").toString(),
            nonce: crypto.randomUUID(),
            state,
        })

        url.search = `?${params.toString()}`

        return url
    }


    async function exchange_code_for_token(code: string, event: AuthEventData) {
        const res = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: options.client_id,
                client_secret: options.client_secret,
                redirect_uri: event.build_url("callback").toString(),
                code,
                grant_type: "authorization_code",
            }),
        })

        const json = await res.json() as {
            access_token: string
            expires_in: number
            refresh_token: string
            scope: string
            token_type: string,
            id_token: string
        } | {
            error: string
            error_description: string
        }

        if ("error" in json) throw new AuthError("invalid_request", json.error_description, 400)

        return json
    }

    async function fetch_profile(token: string): Promise<LuminaAuth.ProfilesWithProvider["google"]> {
        const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        const json = await res.json() as GoogleProfile

        return {
            provider: "google",
            ...json,
        }
    }

    async function handle_callback(event: AuthEventData): Promise<AuthResult> {
        const {
            request, searchParams, auth_system 
        } = event

        if (request.method !== "GET") throw new AuthError("invalid_request", "Method not allowed", 405)

        // validate the state
        const state = searchParams.get("state")
        if (!state) throw new AuthError("oauth_error", "No `state` found in request", 400)
        const state_payload = await auth_system.verify_payload(state)
        if (state_payload.type !== "google_state") throw new AuthError("oauth_error", "Invalid `state` found in request", 400)

        // exchange the code for a token
        const code = searchParams.get("code")
        if (!code) throw new AuthError("oauth_error", "No `code` found in request", 400)
        const auth_result = await exchange_code_for_token(code, event)

        if (!auth_result.access_token) throw new AuthError("invalid_request", "No `access_token` found in request", 400)

        return {
            type: "profile",
            profile: await fetch_profile(auth_result.access_token) 
        }
    }

    return {
        provider: "google",
        async handle(event) {
            switch (event.path) {
                case "signin": return {
                    type: "redirect",
                    redirect_uri: await build_auth_url(event)
                }
                case "callback": return handle_callback(event)
                default: throw new AuthError("unknown_url", "Unknown authentication path", 404)
            }
        },
    }
}