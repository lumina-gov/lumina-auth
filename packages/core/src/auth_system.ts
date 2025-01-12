import {
    JWTPayload, jwtVerify, JWTVerifyOptions, SignJWT 
} from "jose"
import { Provider } from "./provider.js"
import { Awaitable } from "./ts_utils.js"
import { SIGNIN_PARAM, SIGNIN_PROVIDER_PARAM, SIGNOUT_PARAM } from "./client.js"
import { catch_error } from "./error.js"

export type AuthResult =
    | { type: "redirect",
        redirect_uri: URL }
    | { type: "profile",
        profile: LuminaAuth.Profile }
    | { type: "signout" }

export type AuthEventData = {
    path: string
    searchParams: URLSearchParams
    build_url: (path: string) => URL
    request: Request
    auth_system: AuthSystem
}

export type AuthHandler = (event: AuthEventData) => Awaitable<AuthResult>
export type ProviderMap = { [Key in LuminaAuth.ProviderName]: Provider<Key> }

export abstract class AuthSystem {
    base_path: string = "/auth"
    protected abstract providers: ProviderMap
    protected abstract secret: string
    protected abstract profile_to_session(profile: LuminaAuth.Profile): Awaitable<LuminaAuth.JWTSession>

    protected async session_to_token(session: LuminaAuth.JWTSession): Promise<string> {
        const jwt = this.create_jwt(session)
            .setExpirationTime("1w")

        return await this.sign_jwt(jwt)
    }

    async verify_payload<T extends JWTPayload>(token: string, options?: JWTVerifyOptions): Promise<T> {
        const encoder = new TextEncoder()
        const { payload } = await jwtVerify<T>(token, encoder.encode(this.secret), options)
        return payload
    }

    create_jwt<T extends JWTPayload>(payload: T): SignJWT {
        return new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
    }

    async sign_jwt(jwt: SignJWT): Promise<string> {
        const encoder = new TextEncoder()
        return await jwt.sign(encoder.encode(this.secret))
    }

    /**
     * Handle an authentication request
     * 
     * @param event - The event to handle
     * @returns The response or null if the request is not an authentication request
     */
    protected async auth_request(request: Request): Promise<AuthResult | null> {
        return await catch_error(async () => {
            const url = new URL(request.url)

            // capture the globally available signin request, by redirecting it to the correct URL location
            if (url.searchParams.get(SIGNIN_PARAM)) {
                const provider = url.searchParams.get(SIGNIN_PROVIDER_PARAM) as LuminaAuth.ProviderName

                const redirect_url = new URL(`${this.base_path}/${provider}/signin`, request.url)
                return {
                    type: "redirect",
                    redirect_uri: redirect_url,
                }
            }

            if (url.searchParams.get(SIGNOUT_PARAM)) {
                return {
                    type: "signout"
                }
            }

            // This request doesn't concern us
            if (!url.pathname.startsWith(this.base_path + "/")) return null

            // cut out the base path plus a slash
            const remaining = url.pathname.slice(this.base_path.length + 1)
            if (!remaining) return null

            // split the remaining path to get the provider name and the ...rest of the path
            const [provider_name, ...parts] = remaining.split("/") as [LuminaAuth.ProviderName, ...string[]]

            // This request doesn't concern us
            if (!provider_name) return null

            const provider = this.providers[provider_name as keyof typeof this.providers] as Provider<LuminaAuth.ProviderName>

            // This request doesn't concern us, or the provider doesn't exist
            if (!provider) return null

            const auth_event: AuthEventData = {
                path: parts.join("/"),
                searchParams: url.searchParams,
                request,
                build_url: path => new URL(`${this.base_path}/${provider_name}/${path}`, request.url),
                auth_system: this,
            }

            return await provider.handle(auth_event)
        })
    }
}