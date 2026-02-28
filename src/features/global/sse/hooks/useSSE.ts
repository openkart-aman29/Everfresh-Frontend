import { useEffect } from 'react';
import { sseService } from '@/features/global/sse/services/SSEService';

export const useSSE = (eventName: string, handler: (data: any) => void) => {
    useEffect(() => {
        sseService.on(eventName, handler);
        return () => {
            sseService.off(eventName, handler);
        };
    }, [eventName, handler]);
};
