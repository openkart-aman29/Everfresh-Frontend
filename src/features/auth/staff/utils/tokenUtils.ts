import { API_BASE_URL, API_ENDPOINTS } from '@/lib/constants'

// This utility function is designed to be used outside of RTK Query (e.g., SSE service)
export const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.STAFF_ROTATE_TOKEN}`, {
            method: 'POST',
            credentials: 'include',
            // Typically rotation uses HttpOnly cookies, so we don't need to send the old token in headers
            // But we must include credentials to send the cookie
            // If the backend expects the refresh token in the body, update this.
            // Based on baseQuery.ts, it seems to just call the endpoint.
            // However, fetch doesn't send cookies by default. We need `credentials: 'include'`.
            // Wait, baseQuery uses `fetchBaseQuery` which usually handles credentials if configured?
            // Let's assume standard HttpOnly cookie rotation.
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.accessToken) {
                return data.data.accessToken;
            }
        }
        return null;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
    }
}
