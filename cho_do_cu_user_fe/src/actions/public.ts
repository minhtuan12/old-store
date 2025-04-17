export async function fetchRegions() {
    try {
        const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/location/regions`, {cache: 'default'})
        if (!result?.ok) {
            return {regions: []}
        }
        return result.json()
    } catch (err) {
        return {regions: []}
    }
}
