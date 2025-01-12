import { redirect, RequestEvent, ResolveOptions } from "@sveltejs/kit"
import {
    AuthError,
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

    get handler() {
        return sequence(
            this.handle.bind(this),
            this.session_provider.bind(this)
        )
    }

    protected async handle({ event, resolve }: SvelteKitHandlerParams): Promise<Response> {
        try {
            const auth_result = await this.auth_request(event.request)

            if (!auth_result) return resolve(event)

            switch (auth_result.type) {
                case "redirect": return redirect(307, auth_result.redirect_uri.toString())
                case "profile": {
                    const session = await this.profile_to_session(auth_result.profile)
                    const token = await this.session_to_token(session)
                    const location = await this.get_success_callback(event, session)
                    this.set_cookie(event, this.token_cookie_name, token)

                    throw redirect(303, new URL(location, event.url).toString())
                }
                case "signout": {
                    this.set_cookie(event, this.token_cookie_name, "")
                    return resolve(event)
                }
            }
        } catch (e) {
            if (e instanceof AuthError) return await this.on_auth_error(event, e)
            throw e
        }
    }

    protected abstract get_success_callback(event: RequestEvent, session: LuminaAuth.JWTSession): Awaitable<string>

    protected on_auth_error(_event: RequestEvent, error: AuthError): Awaitable<Response> {
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
            // otherwise invalid, so we can just ignore it and leave the session as null
        }

        return resolve(event)
    }
}
