import { Prettify } from "./utils"

export function provider_name<
    P extends AuthNamespace.ProfileName,
>(provider: P): P {
    return provider
}


export abstract class Provider<P, I, O> {
    abstract handle(request: I): Promise<O>

    constructor() {
        
    }
}

declare global {
    namespace AuthNamespace {
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

export {}
