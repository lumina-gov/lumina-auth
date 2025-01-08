
import { sequence } from "@sveltejs/kit/hooks"
import { handler } from "./auth"

export const handle = sequence(
    handler
)