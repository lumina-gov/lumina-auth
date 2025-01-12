
import { sequence } from "@sveltejs/kit/hooks"
import { auth_system } from "./auth"

export const handle = sequence(
    auth_system.handler,
)
