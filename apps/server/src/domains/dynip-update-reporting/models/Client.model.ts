export type Client = {
    id: string
    name: string
    password: {
        hash: string
        salt: string
    }
    userId: string,
    createAt: Date
    updateAt: Date
}