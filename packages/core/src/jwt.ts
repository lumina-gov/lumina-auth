import { SignJWT, jwtVerify, type JWTPayload } from "jose"
export type { JWTPayload } from "jose"

export async function sign_jwt<T extends JWTPayload>(data: T, { expiresIn = "1w" } = {}, secret: string) {
    const encoder = new TextEncoder()
    return await new SignJWT(data)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(encoder.encode(secret))
}

export async function verify_jwt<T extends JWTPayload>(token: string, secret: string) {
    const encoder = new TextEncoder()
    return await jwtVerify<T>(token, encoder.encode(secret))
}
