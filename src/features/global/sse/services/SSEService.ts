import { EventSourcePolyfill } from 'event-source-polyfill';
import { API_BASE_URL } from '@/lib/constants';
import { store } from '@/store/Store';
import { updateAccessToken, logout } from '@/features/auth/staff/slices/StaffAuthSlice';
import { refreshAccessToken } from '@/features/auth/staff/utils/tokenUtils';

type SSEEventHandlers = {
    [key: string]: ((data: any) => void)[];
};

class SSEService {
    private eventSource: EventSourcePolyfill | null = null;
    private handlers: SSEEventHandlers = {};
    private pendingConnection: boolean = false;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private url: string;
    private isRefreshing: boolean = false;

    constructor() {
        // Construct the SSE URL. 
        // Assuming API_BASE_URL is like '/api/v1', and the SSE endpoint is '/sse/events'.
        // If API_BASE_URL contains the domain (e.g. http://localhost:3000/api/v1), we need to be careful.
        // Based on typical setups, we'll append to API_BASE_URL.
        // If API_BASE_URL ends with /, remove it.
        const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
        this.url = `${baseUrl}/sse/events`;
    }

    public connect(token: string) {
        if (this.eventSource || this.pendingConnection || this.isRefreshing) {
            return;
        }

        this.pendingConnection = true;

        try {
            this.eventSource = new EventSourcePolyfill(this.url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                heartbeatTimeout: 45000,
            });

            this.eventSource.onopen = () => {
                console.log('SSE connection established');
                this.pendingConnection = false;
                if (this.reconnectTimeout) {
                    clearTimeout(this.reconnectTimeout);
                    this.reconnectTimeout = null;
                }
            };

            this.eventSource.onerror = async (err: any) => {
                console.error('SSE connection error:', err);

                // Check for 401 specifically if provided by polyfill
                const isUnauthorized = err?.status === 401 || err?.code === 401;

                this.disconnect();

                if (isUnauthorized) {
                    if (!this.isRefreshing) {
                        this.isRefreshing = true;
                        console.log('SSE: Token expired, attempting refresh...');

                        const newToken = await refreshAccessToken();

                        this.isRefreshing = false;

                        if (newToken) {
                            console.log('SSE: Token refreshed successfully');
                            // Dispath new token to store. 
                            store.dispatch(updateAccessToken(newToken));
                        } else {
                            console.error('SSE: Token refresh failed, logging out');
                            store.dispatch(logout());
                        }
                    }
                    return;
                }

                // Standard reconnect for other errors
                this.reconnectTimeout = setTimeout(() => this.connect(token), 5000);
            };

            // Generic message handler
            this.eventSource.onmessage = (event: any) => {
                // Heartbeats or generic messages
                try {
                    if (event.data === ': keep-alive') return;
                    const data = JSON.parse(event.data);
                    this.emit('message', data);
                } catch (e) {
                    // ignore parse errors for keep-alives or non-json
                }
            };

            // Listen for specific events
            this.eventSource.addEventListener('connection_established', (event: any) => {
                this.emit('connection_established', JSON.parse(event.data));
            });

            this.eventSource.addEventListener('booking_created', (event: any) => {
                this.emit('booking_created', JSON.parse(event.data));
            });

            this.eventSource.addEventListener('server_shutdown', (event: any) => {
                console.warn('Server shutting down, closing SSE connection.');
                this.emit('server_shutdown', JSON.parse(event.data));
                this.disconnect();
            });

        } catch (error) {
            console.error('Failed to create EventSource:', error);
            this.pendingConnection = false;
            this.disconnect();
        }
    }

    public disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
        this.pendingConnection = false;
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        console.log('SSE connection closed');
    }

    public on(event: string, handler: (data: any) => void) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
    }

    public off(event: string, handler: (data: any) => void) {
        if (!this.handlers[event]) return;
        this.handlers[event] = this.handlers[event].filter(h => h !== handler);
    }

    private emit(event: string, data: any) {
        if (this.handlers[event]) {
            this.handlers[event].forEach(handler => handler(data));
        }
    }
}

export const sseService = new SSEService();
