import {
    redirect, RequestEvent, ResolveOptions 
} from "@sveltejs/kit"
import {
    AuthResult,
    AuthSystem,
} from "@lumina-auth/core"
import { Awaitable } from "@lumina-auth/core"
import { sequence } from "@sveltejs/kit/hooks"

declare global {
    namespace App {
        interface Locals {
            session: LuminaAuth.JWTSession | null
        }
    }
}

type SvelteKitHandlerParams = {
    event: RequestEvent;
    resolve(event: RequestEvent, opts?: ResolveOptions): Awaitable<Response>;
}

export abstract class SvelteKitAuthSystem extends AuthSystem {
    token_cookie_name: string = "auth-token"

    cookie_options = {
        path: "/",
        httpOnly: false,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    } as const

    protected abstract handle_signin(event: RequestEvent, session: LuminaAuth.JWTSession): Awaitable<never>

    get handler() {
        return sequence(
            this.handle.bind(this),
            this.session_provider.bind(this)
        )
    }

    protected async handle({ event, resolve }: SvelteKitHandlerParams): Promise<Response> {
        let auth_result: AuthResult | null
        try {
            auth_result = await this.auth_request(event.request)
        } catch (e) {
            throw await this.handle_error(e, event)
        }

        // Let this event continue to the next handler
        if (!auth_result) return await resolve(event)

        try {
            // otherwise, handle the auth result
            switch (auth_result.type) {
                case "redirect": redirect(307, auth_result.redirect_uri.toString())
                case "profile": await this.handle_profile(event, auth_result.profile)
                case "signout": return await this.handle_signout(event)
            }
        } catch (e) {
            throw await this.handle_error(e, event)
        }
    }

    protected async handle_profile(event: RequestEvent, profile: LuminaAuth.Profile): Promise<never> {
        const session = await this.profile_to_session(profile)
        const token = await this.session_to_token(session)

        this.set_cookie(event, this.token_cookie_name, token)

        throw await this.handle_signin(event, session)
    }

    protected async handle_signout(event: RequestEvent): Promise<Response> {
        this.set_cookie(event, this.token_cookie_name, null)
        return new Response(null, { status: 204 })
    }


    protected handle_error(error: unknown, _event: RequestEvent): Awaitable<never> {
        throw error
    }

    protected async get_session(event: RequestEvent): Promise<LuminaAuth.JWTSession | null> {
        const token = event.cookies.get(this.token_cookie_name)

        if (!token) return null

        return await this.verify_payload(token)
    }

    protected set_cookie(event: RequestEvent, name: string, value: string | null): void {
        if (value) {
            event.cookies.set(name, value, this.cookie_options)
        } else {
            event.cookies.delete(name, this.cookie_options)
        }
    }

    protected async session_provider({ event, resolve }: SvelteKitHandlerParams): Promise<Response> {
        event.locals.session = null

        try {
            event.locals.session = await this.get_session(event)
        } catch (e) {
            // an error occured whilst verifying the token, it may be expired or
            // otherwise invalid, so we should just ignore it and leave the session as null
        }
        return resolve(event)
    }
}
