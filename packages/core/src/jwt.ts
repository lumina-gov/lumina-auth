import { SignJWT, jwtVerify, type JWTPayload } from "jose"

export async function sign_jwt(data: JWTPayload, { expiresIn = "6h" } = {}, secret: string){
    const SECRET = new TextEncoder().encode(secret)
    return await new SignJWT(data)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(SECRET)
}

export async function verify_jwt<T>(token: string, secret: string){
    const SECRET = new TextEncoder().encode(secret)
    return await jwtVerify<T>(token, SECRET)
}