
export const BASE_PATH = "/auth/"

export interface BaseOptions {
    /**
     * Base options for authentication providers
     * @property success_redirect - URL to redirect to after successful authentication
     */
    success_redirect?: string
}

export type SigninOptions<P extends LuminaAuth.ProviderName> = LuminaAuth.ProviderSigninOptions[P] | BaseOptions

export async function signin<P extends LuminaAuth.ProviderName>(
    provider: P,
    options: SigninOptions<P>
): Promise<void> {
    const form = document.createElement("form")
    console.log(form)
    form.method = "POST"
    form.enctype = "application/json"
    form.action = `${BASE_PATH}${provider}/signin`
    form.append("data", JSON.stringify({
        provider,
        options,
    }))

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
}
