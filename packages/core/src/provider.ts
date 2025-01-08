

export type AuthResult =
    | { type: "redirect", redirect_uri: string }
    | { type: "profile", profile: LuminaAuth.Profile }


export type AuthEventData = {
    url: URL
    request: Request
}

export type AuthHandler = (event: AuthEventData) => Promise<AuthResult>

export interface Provider<Name extends LuminaAuth.ProviderName> {
    provider: Name
    // signin: (options: Name extends keyof LuminaAuth.ProviderSigninOptions ? LuminaAuth.ProviderSigninOptions[Name] : never) => Promise<void>
    handle: AuthHandler
}

export interface OAuthProvider<Name extends LuminaAuth.ProviderName> extends Provider<Name> {
    provider: Name
    name: string
    type: "oidc" | "oauth"
    issuer: string
    handle: AuthHandler
}
