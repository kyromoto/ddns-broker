import { generateHash, generateSalt } from "./password-util"

describe("generate password salt", () => {

    it("should generate salt", () => {
        const salt = generateSalt()
        expect(salt).not.toBeFalsy()
    })

    it ("should generate salt with base64 encoding", () => {
        const salt = generateSalt()
        expect(Buffer.from(salt, "base64").toString("base64")).toBe(salt)
    })

    it ("should generate salt with 32 bytes length", () => {
        const salt = generateSalt()
        expect(Buffer.from(salt, "base64").length).toBe(32)
    })

    it("should generate different salts", () => {
        const salt1 = generateSalt()
        const salt2 = generateSalt()
        expect(salt1).not.toBe(salt2)
    })

})



describe ("generate password hash", () => {

    const password = "password"
    const salt = "salt"

    it("should generate hash", () => {
        const hash = generateHash(password, salt)
        expect(hash).not.toBeFalsy()
    })

    it ("should generate hash with base64 encoding", () => {
        const hash = generateHash(password, salt)
        expect(Buffer.from(hash, "base64").toString("base64")).toBe(hash)
    })

})