
import { GoogleProvider } from "@lumina-auth/provider-google"
import { DiscordProvider } from "@lumina-auth/provider-discord"
import { provider_name } from "@lumina-auth/core"

// const session: AuthNamespace.Session = {
//     id: "123",
//     name: "Test User"
// }

provider_name("discord")

const profile: AuthNamespace.Profile = {
    provider: "google",
    id: "123",
    email: "test@test.com",
    name: "Test User"
}

const provider = new GoogleProvider()


// declare global {
//     namespace AuthNamespace {
//         interface Session {
//             id: string
//             name: string
//         }
//     }
// }

// const session: AuthNamespace.Session = {
//     id: "123",
//     name: "Test User"
// }


// const test_profile: AuthNamespace.Profile = {
//     provider: "google",
//     id: "123",
//     email: "test@test.com",
//     name: "Test User"
// }