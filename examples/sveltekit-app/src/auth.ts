import { AUTH_SECRET, GOOGLE_ID, GOOGLE_SECRET } from "$env/static/private"
import { SvelteKitAuthSystem } from "@lumina-auth/framework-sveltekit"
import { GoogleProvider } from "@lumina-auth/provider-google"
import { CredentialsProvider } from "@lumina-auth/provider-credentials"

class AuthSystem extends SvelteKitAuthSystem {
    secret = AUTH_SECRET

    providers = {
        google: GoogleProvider({
            client_id: GOOGLE_ID,
            client_secret: GOOGLE_SECRET,
        }),
        credentials: CredentialsProvider(async credentials => {
            return {
                id: "1",
                email: credentials.email,
                name: "Test User",
            }
        })
    }

    async profile_to_session(profile: LuminaAuth.Profile) {
        console.log(profile)
        return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
        }
    }

    protected async get_success_callback(): Promise<string> {
        return "/"
    }
}

export const auth_system = new AuthSystem()