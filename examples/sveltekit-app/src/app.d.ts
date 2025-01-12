

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }

    namespace LuminaAuth {
        interface JWTSession {
            id: string
            email: string
            name: string
        }

        interface CredentialsProfile {
            id: string
            email: string
            name: string
        }

        interface CredentialsSigninOptions {
            email: string
            password: string
        }
    }
}


export {}
