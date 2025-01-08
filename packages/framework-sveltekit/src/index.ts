import { error, Handle, redirect, RequestEvent } from "@sveltejs/kit"
import {
    type Provider,
    AuthError,
    BASE_PATH,
    sign_jwt as jwt_signer,
    verify_jwt as jwt_verifier,
    JWTPayload
} from "@lumina-auth/core"
import { Awaitable } from "@lumina-auth/core/dist/ts_utils"
import { sequence } from "@sveltejs/kit/hooks"

type SvelteKitAuthOptions = {
    secret: string
    providers: {
        [Key in LuminaAuth.ProviderName]: Provider<Key>
    }
    profile_to_jwt: (profile: LuminaAuth.Profile) => Awaitable<LuminaAuth.JWTSession>
    sign_jwt?: (payload: LuminaAuth.JWTSession) => Awaitable<string>
    verify_jwt?: (token: string) => Awaitable<LuminaAuth.JWTSession>
    set_cookie?: (event: RequestEvent, token: string) => void
    get_cookie?: (event: RequestEvent) => string | undefined
    delete_cookie?: (event: RequestEvent) => void
}

export function SvelteKitAuth({
    providers,
    secret,
    profile_to_jwt,
    sign_jwt = async payload => await jwt_signer(payload, { expiresIn: "1w" }, secret),
    verify_jwt = async token => {
        const { payload } = await jwt_verifier(token, secret)

        return payload
    },
    set_cookie = (event, token) => event.cookies.set("lumina-auth-token", token, {
        path: "/",
        httpOnly: false,
        secure: false,
        sameSite: "strict",
        domain: event.url.hostname
    }),
    delete_cookie = (event) => event.cookies.delete("lumina-auth-token", {
        path: "/",
        domain: event.url.hostname
    }),
    get_cookie = (event) => event.cookies.get("lumina-auth-token")
}: SvelteKitAuthOptions) {
    const signin_handler: Handle = async ({ event, resolve }) => {
        const { request, url } = event

        if (!url.pathname.startsWith(BASE_PATH)) return resolve(event)

        const remaining = url.pathname.slice(BASE_PATH.length)
        const [provider] = remaining.split("/")

        if (!provider) return resolve(event)

        const provider_instance = providers[provider as keyof typeof providers] as Provider<LuminaAuth.ProviderName>

        if (!provider_instance) throw error(404, "Provider not found")

        try {
            const auth_result = await provider_instance.handle({ url, request })

            switch (auth_result.type) {
                case "redirect": redirect(303, auth_result.redirect_uri)
                case "profile": {
                    const jwt = await profile_to_jwt(auth_result.profile)
                    const token = await sign_jwt(jwt)
                    set_cookie(event, token)

                    return resolve(event)
                }
            }

        } catch (e) {
            if (e instanceof AuthError) error(e.status, e.message)

            throw e
        }
    }

    const token_handler: Handle = async ({ event, resolve }) => {
        const token = get_cookie(event)

        if (!token) return resolve(event)

        try {
            const session = await verify_jwt(token)

            event.locals.session = session
        } catch (e) {
            // Cookie is invalid, delete it
            delete_cookie(event)
        }

        return resolve(event)
    }

    return {
        handler: sequence(
            signin_handler,
            token_handler
        )
    }
}


declare global {
    namespace App {
        interface Locals {
            session: LuminaAuth.JWTSession
        }
    }
}