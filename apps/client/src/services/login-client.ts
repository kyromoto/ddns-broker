import { BASE_URL } from "@client/config"

const getOptions = (method: "GET" | "POST", body: any) => ({
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
})

export async function loginUser (username: string, password: string) {

    const res = await fetch(`${BASE_URL}/api/ddns-gw/cmd/login-user`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${btoa(`${username}:${password}`)}`
        },
    })

    return await res.json() as { accessToken: string }

}