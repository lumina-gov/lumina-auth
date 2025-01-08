


## 1. User clicks signin button

`login/+page.svelte`
```svelte
<script>
    import { signin } from "@lumina-auth/client"
    import { auth_state } from "@lumina-auth/svelte"

    // auth_state contains perhaps some error data, eg:
    // $auth_state.error

    async function signin_with_google(){
        await signin({
            provider: "google",
            success_callback: "/",
            failure_callback: "/login",
        })
        // i'm assuming this code beyond here never runs?
        // or does it?
    }
</script>
```

## 2. API call to our backend API auth handler

```http
POST /auth/handler
```

## 3. Provider's auth handler
1. Creates an Auth URL
2. Redirects the user to the Auth URL
3. User signs in:
    - User is redirected back to our backend with the provider's code
    - Our backend exchanges the code for an access token
    - Provider loads the user's profile data
    - Developer-provided callback is called with the user's profile data
       - Developer may decide to do something like create an `account` record in the database if it doesn't exist
       - And then potentially create/return a `user` / `session` object
     - A JWT is created using developer-specified code
     - User is redirected back to the success callback
4. User fails to sign in:
    - User is redirected back to the failure callback with the error data encoded in the URL
    - Or perhaps, a developer-specified/provided handler is called with the error data


`src/auth.ts`
```ts
import {
    GOOGLE_ID,
    GOOGLE_SECRET,
    AUTH_SECRET
} from "$env/static/private"
import { SvelteAuthSystem } from "@lumina-auth/framework-svelte"

const {
    auth_handler
} = SvelteAuthSystem({
    on_error({ error, req, jwt, event }) {
        // developer can perhaps decide here what to do, eg:
        // redirect to the login page, or return an error
        // etc
        // this could be caused by a multitude of reasons, eg:
        // - the JWT is expired or otherwise invalid
        // - a provider's auth handler returns an error
        // - the developer's profile_to_user function returns an error
        // - the developer's session_to_jwt_payload function returns an error
        // - the developer's jwt_payload_to_session function returns an error
        // - the developer's sign_jwt function returns an error
        // - the developer's session_to_user function returns an error
        // - etc

        // by default, we may also want to clear the session cookie or whatever
    },
    secret: AUTH_SECRET,
    providers: [
        GoogleProvider({
            client_id: GOOGLE_ID,
            client_secret: GOOGLE_SECRET,
        }),
        CredentialsProvider<{ email: string, password: string }>({
            async get_profile(credentials) {
                // check if the user exists in the database
                // otherwise, return an error or null or something
                // otherwise, return a profile object
            }
        })
    ],
    // or it could be async profile_to_session(profile): Awaitable<AuthNamespace.Session>
    async profile_to_user(
        profile // this profile is automatically typed as a union type based on the provided providers
    ): Awaitable<AuthNamespace.User> {

        // --- Pseudo algorithm cases ---
        // 1. User exists in the database with the same email address and has an account with the provider
        // 2. User exists in the database with the same email address but does not have an account with the provider
        // 3. User does not exist in the database with the same email address
        // 4. The account exists, but it's email has changed, we should update the user's email address
        // 5. Both exist, so we should update user settings

        // A user might exist in the database with the same email address, but not have an account with the provider

        // --- Pseudo algorithm ---
        // we first need to check if the user with the email address exists
        // maybe create an account record in the database
        // or link the user with that profile email to an existing user which exists
        // in the database?
        // perhaps create the user itself, if it doesn't exist
        // then retrieve the created user, or the existing user from some kind of data store or whatever
        // and finally return a user object or "session" data object
    },
    // default implementation
    async session_to_jwt_payload(session: AuthNamespace.Session): Awaitable<JWTPayload<AuthNamespace.Session>> {
        return session
    },
    // default implementation
    async jwt_payload_to_session(jwt: JWTPayload<AuthNamespace.Session>): Awaitable<AuthNamespace.Session> {
        return jwt
    },
    // default implementation
    async sign_jwt(jwt: JWTPayload<AuthNamespace.Session>): Awaitable<string> {
        await sign_jwt(jwt, { expiresIn: "6h" }, this.secret)
    }
    // user must provide this function
    // or potentially, we just entirely get rid of the concept of a "user" and merely have a global "session" type
    // which the user themselves can implement the logic for converting a session into a user or whatever 
    async session_to_user(session: AuthNamespace.Session): Awaitable<AuthNamespace.User> {
        // eg:
        return {
            id: session.id,
            email: session.email,
            name: session.name,
        }
    },

})

```


`hooks.server.ts`
```ts
import { sequence } from "@sveltejs/kit/hooks"
import { auth_handler } from "./auth"

export const handle = sequence(
    auth_handler
)
```

