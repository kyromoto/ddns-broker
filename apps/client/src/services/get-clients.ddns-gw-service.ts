export async function getClientsByUser (userId: string) {
    const res = await fetch(`/api/ddns-gw/query/get-clients-by-user?userId=${userId}`)
    return await res.json()
}