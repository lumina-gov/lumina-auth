import { AUTH_SECRET, GOOGLE_ID, GOOGLE_SECRET } from "$env/static/private"
import { SvelteKitAuth } from "@lumina-auth/framework-sveltekit"
import { GoogleProvider } from "@lumina-auth/provider-google"


export const { handler } = SvelteKitAuth({
    profile_to_jwt(profile) {
        return {
            id: profile.id,
            email: profile.email,
            name: profile.name,
        }
    },
    secret: AUTH_SECRET,
    providers: {
        google: GoogleProvider({
            client_id: GOOGLE_ID,
            client_secret: GOOGLE_SECRET,
        })
    }
})
