import crypto from "node:crypto"



export const generateSalt = () => crypto.randomBytes(32).toString("base64")
export const generateHash = (password: string, salt: string) => crypto.createHash("sha256").update(password + salt).digest("base64")

export const generatePasswordHashAndSalt = (password: string) => {
    
    const salt = generateSalt()
    const hash = generateHash(password, salt)
    
    return { hash, salt }
}