import { AuthError } from "@lumina-auth/core"
import { Provider } from "@lumina-auth/core"
import type { AuthEventData, Awaitable } from "@lumina-auth/core"


declare global {
    namespace LuminaAuth {
        interface ProviderProfiles {
            credentials: CredentialsProfile
        }

        interface CredentialsProfile {

        }

        interface CredentialsSigninOptions {

        }

        interface ProviderSigninOptions {
            credentials?: CredentialsSigninOptions
        }
    }
}

export function CredentialsProvider(
    signin: (credentials: LuminaAuth.CredentialsSigninOptions) => Awaitable<LuminaAuth.CredentialsProfile>
): Provider<"credentials"> {


    async function handle_signin(event: AuthEventData): Promise<LuminaAuth.ProfilesWithProvider["credentials"]> {
        const { request } = event
        if (request.method !== "POST") throw new AuthError("invalid_request", "Method not allowed", 405)

        const form = await request.formData()
        const data = form.get("data") as string | null
        if (!data) throw new AuthError("invalid_request", "Missing data", 400)
        if (typeof data !== "string") throw new AuthError("invalid_request", "Invalid data", 400)

        const credentials = JSON.parse(data)

        const profile = await signin(credentials) as LuminaAuth.CredentialsProfile

        return {
            ...profile,
            provider: "credentials",
        }
    }

    return {
        provider: "credentials",
        async handle(event) {
            switch (event.path) {
                case "signin": return {
                    type: "profile",
                    profile: await handle_signin(event)
                }
                default: throw new AuthError("unknown_url", "Unknown authentication path", 404)
            }
        },
    }
}