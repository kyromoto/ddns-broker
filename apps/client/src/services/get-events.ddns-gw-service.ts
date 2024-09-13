export async function getEventsByUserId (userId: string) {
    const res = await fetch(`/api/ddns-gw/query/get-events-by-user?userId=${userId}`)
    return await res.json()
}