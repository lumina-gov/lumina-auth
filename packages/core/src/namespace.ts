import { Prettify } from "./ts_utils"

declare global {
    namespace LuminaAuth {
        interface Session {}
        interface JWT {}
        interface ProviderProfileMap {}
        // interface CredentialsProfile {}

        type ProfileName = keyof ProviderProfileMap
        type NamedProfileMap = {
            [Name in ProfileName]: Prettify<{
                provider: Name
            } & ProviderProfileMap[Name]>
        }

        type Profile = NamedProfileMap[ProfileName]
    }
}

