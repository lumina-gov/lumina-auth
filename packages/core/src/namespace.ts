import { Prettify } from "./ts_utils"

declare global {
    namespace LuminaAuth {
        interface JWTSession {
            [key: string]: unknown
        }
        interface ProviderProfiles { }
        interface ProviderSigninOptions { }
        interface CredentialsProfile { }

        type ProviderName = keyof ProviderProfiles

        type ProfilesWithProvider = {
            [Name in ProviderName]: Prettify<{
                provider: Name
            } & ProviderProfiles[Name]>
        }

        type Profile = ProfilesWithProvider[ProviderName]
    }
}

