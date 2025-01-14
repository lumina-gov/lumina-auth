export const SIGNIN_PARAM = "__auth_signin"
export const SIGNOUT_PARAM = "__auth_signout"
export const SIGNIN_PROVIDER_PARAM = "provider"
// export interface BaseOptions {
//     // /**
//     //  * Base options for authentication providers
//     //  * @property success_redirect - URL to redirect to after successful authentication
//     //  * 
//     //  * @default `window.location.href`
//     //  */
//     // success_redirect?: string
//     // /**
//     //  * URL to redirect to after unsuccessful authentication
//     //  * Errors will be appended to the URL via the `error` query parameter
//     //  * eg: `?error=error_code&error_description=error_description`
//     //  * 
//     //  * @default `window.location.href`
//     //  */
//     // error_redirect?: string
// }

type SigninOptions<P extends LuminaAuth.ProviderName> = P extends keyof LuminaAuth.ProviderSigninOptions ? LuminaAuth.ProviderSigninOptions[P] : never

/**
 * ## Usage
 * ```ts
 * import { signin } from "@lumina-auth/core"
 * 
 * // Sign in with Google
 * await signin("google", {
 *     success_redirect: "https://example.com/dashboard",
 * })
 * ```
 * 
 * ### Passing State
 * You can optionally also use the URL search params to pass in state that you would
 * like to persist during a failed or successful authentication attempt
 * 
 * #### Svelte Example
 * 
 * Here we store the user's email address in the URL search params so that if their request
 * failed, they don't have to re-enter their email address
 * 
 * ```svelte
 * <script>
 * let email = $state("")
 * let password = $state("")
 * 
 * onMount(() => {
 *     // If they had an email in the URL search params, set it
 *     let email = window.location.searchParams.get("email") || ""
 * })
 * 
 * async function signin_credentials() {
 *     await signin("credentials", {
 *         success_redirect: "https://example.com/dashboard",
 *         error_redirect: `https://example.com/signin?email=${encodeURIComponent(email)}`,
 *         email,
 *         password,
 *     })
 * }
 * </script>
 * <input type="email" bind:value={email} />
 * <input type="password" bind:value={password} />
 * <button onclick={signin_credentials}>Sign in</button>
 * ```
 */



export async function signin<P extends LuminaAuth.ProviderName>(
    provider: P,
    ...rest: SigninOptions<P> extends never ? [] : [SigninOptions<P>]
): Promise<void> {
    const url = new URL(window.location.href)
    url.searchParams.set(SIGNIN_PARAM, "true")
    url.searchParams.set(SIGNIN_PROVIDER_PARAM, provider)

    const form = document.createElement("form")
    form.method = "POST"
    form.action = url.toString()

    if (rest[0]) {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = "data"
        input.value = JSON.stringify(rest[0])
        form.appendChild(input)
    }

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
}

export async function signout() {
    const url = new URL(window.location.href)
    url.searchParams.set(SIGNOUT_PARAM, "true")
    await fetch(url.toString())
}