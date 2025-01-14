import { AUTH_SECRET, GOOGLE_ID, GOOGLE_SECRET } from "$env/static/private"
import { SvelteKitAuthSystem } from "@lumina-auth/framework-sveltekit"
import { GoogleProvider } from "@lumina-auth/provider-google"
import { CredentialsProvider } from "@lumina-auth/provider-credentials"
import { redirect } from "@sveltejs/kit"
import type { AuthError, Awaitable } from "@lumina-auth/core"

class AuthSystem extends SvelteKitAuthSystem {
    secret = AUTH_SECRET

    providers = {
        google: GoogleProvider({
            client_id: GOOGLE_ID,
            client_secret: GOOGLE_SECRET,
        }),
        credentials: CredentialsProvider(async credentials => {
            throw new Error("User doesn't exist")
            return {
                id: "1",
                email: credentials.email,
                name: "Test User",
            }
        })
    }

    async profile_to_session(profile: LuminaAuth.Profile) {
        return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
        }
    }

    protected async handle_signin(): Promise<never> {
        throw redirect(303, "/")
    }

    protected async handle_error(error: AuthError): Awaitable<never> {
        console.log(error)
        throw redirect(303, `/?error=${encodeURIComponent(JSON.stringify(error))}`);
    }
}

export const auth_system = new AuthSystem()