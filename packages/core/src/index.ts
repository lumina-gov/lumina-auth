import type { Prettify } from "./ts_utils"

export * from "./provider.js"
export * from "./ts_utils.js"
export * from "./client.js"
export * from "./error.js"
export * from "./auth_system.js"


declare global {
    namespace LuminaAuth {
        interface JWTSession {
            [key: string]: unknown
        }
        interface ProviderProfiles { }
        interface ProviderSigninOptions { }

        type ProviderName = keyof ProviderProfiles

        type ProfilesWithProvider = {
            [Name in ProviderName]: Prettify<{
                provider: Name
            } & ProviderProfiles[Name]>
        }

        type Profile = ProfilesWithProvider[ProviderName]
    }
}