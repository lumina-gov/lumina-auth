<script lang="ts">
import { signin } from "@lumina-auth/core"

async function signin_with_google() {
    await signin("google", {
        success_redirect: "/auth/callback",
    })
}
</script>

<button onclick={signin_with_google}>Sign in with Google</button>
