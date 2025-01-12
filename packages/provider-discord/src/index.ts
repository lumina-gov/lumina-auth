import { OAuthProvider } from "@lumina-auth/core";
import type { AuthResult, AuthError } from "@lumina-auth/core";

export interface DiscordRequest {
    callback: string
}

export interface DiscordResponse {
    redirect_uri: string
}

export interface DiscordProfile {
    discord_username: string
}

export interface DiscordSigninOptions {
    callback: string
}

declare global {
    namespace LuminaAuth {
        interface ProviderProfiles {
            discord: DiscordProfile
        }

        interface ProviderSigninOptions {
            discord: DiscordSigninOptions
        }
    }
}

export function DiscordProvider(
    options: {
        client_id: string
        client_secret: string
        redirect_uri: string
    }
): OAuthProvider<"discord"> {
    return {
        provider: "discord",
        name: "Discord",
        type: "oidc",
        issuer: "https://discord.com",
        handle(event): Promise<AuthResult> {
            throw new Error("Not implemented")
        }
    }
}