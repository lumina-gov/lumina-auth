import "@lumina-auth/types"
import { Provider } from "@lumina-auth/core";

export interface DiscordRequest {
    callback: string
}

export interface DiscordResponse {
    redirect_uri: string
}

export interface DiscordProfile {
    discord_username: string
}

declare global {
    namespace AuthNamespace {
        interface ProviderProfileMap {
            discord: {
                discord_username: string
            }
        }
    }
}

export class DiscordProvider extends Provider<DiscordProfile, DiscordRequest, DiscordResponse> {
    constructor() {
        super()
    }

    handle(request: DiscordRequest): Promise<DiscordResponse> {
        throw new Error("Not implemented")
    }
}

