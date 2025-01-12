import { Prettify } from "./ts_utils"

export * from "./provider"
export * from "./client"
export * from "./error"
export * from "./auth_system"
export * from "./ts_utils"


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