import { AuthError, BASE_PATH } from "@lumina-auth/core"
import { AuthHandler, AuthResult, Provider } from "@lumina-auth/core/dist/provider"

export interface GoogleProfile {
    id: string
    email: string
    verified_email: boolean
    name: string
    given_name: string
    family_name: string
    picture: string
}

export interface GoogleSigninOptions {
    scopes?: string[]
}

declare global {
    namespace LuminaAuth {
        interface ProviderProfiles {
            google: GoogleProfile
        }

        interface ProviderSigninOptions {
            google: GoogleSigninOptions
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
    const paths = {
        signin: `${BASE_PATH}google/signin`,
        callback: `${BASE_PATH}google/callback`,
    }

    function build_auth_url(request_url: URL) {
        const url = new URL("/o/oauth2/v2/auth", "https://accounts.google.com")
        const params = new URLSearchParams({
            response_type: "code",
            client_id: options.client_id,
            redirect_uri: new URL(paths.callback, request_url).toString(),
            scope: options.scopes ? options.scopes.join(" ") : "openid email profile",
            prompt: "consent",
            nonce: crypto.randomUUID(),
            include_granted_scopes: "true",
            state: crypto.randomUUID(),
        })

        url.search = params.toString()

        return url.toString()
    }


    async function exchange_code_for_token(code: string, request_url: URL) {
        const res = await fetch(`https://oauth2.googleapis.com/token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: options.client_id,
                client_secret: options.client_secret,
                redirect_uri: new URL(paths.callback, request_url).toString(),
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
        const res = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo`, {
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


    const handlers: Record<string, AuthHandler> = {
        signin: async ({ url }) => {
            const redirect_uri = build_auth_url(url)
            return { type: "redirect", redirect_uri }
        },
        callback: async ({ url, request }) => {
            if (request.method !== "GET") throw new AuthError("invalid_request", "Method not allowed", 405)
            /**
             * @todo Validate state 
             */
            const state = url.searchParams.get("state")
            if (!state) throw new AuthError("invalid_request", "No `state` found in request", 400)

            const code = url.searchParams.get("code")
            if (!code) throw new AuthError("invalid_request", "No `code` found in request", 400)

            const auth_result = await exchange_code_for_token(code, url)

            if (!auth_result.access_token) throw new AuthError("invalid_request", "No `access_token` found in request", 400)

            return { type: "profile", profile: await fetch_profile(auth_result.access_token) }
        },
    }

    return {
        provider: "google",
        handle(event): Promise<AuthResult> {
            let pathname = event.url.pathname
            switch (pathname) {
                case paths.signin:
                    return handlers.signin(event)
                case paths.callback:
                    return handlers.callback(event)
                default:
                    throw new AuthError("unknown_url", "Unknown authentication path", 404)
            }
        },
    }
}
