<script lang="ts">
import { signin } from "@lumina-auth/core"

async function signin_with_google() {
    await signin("google")
}

let { data } = $props()

let email = $state("")
let password = $state("")

async function signin_with_credentials() {
    await signin("credentials", {
        email,
        password
    })
}

</script>

<button onclick={signin_with_google}>Sign in with Google</button>
<hr>
<input type="text" bind:value={email} />
<input type="password" bind:value={password} />
<button onclick={signin_with_credentials}>Sign in with Credentials</button>
<hr>
<p>Session: {JSON.stringify(data.session)}</p>
<style>
hr {
    height: 1px;
    border: none;
    background-color: rgba(0, 0, 0, 0.2);
}
</style>