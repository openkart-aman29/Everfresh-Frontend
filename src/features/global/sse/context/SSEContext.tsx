import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/Store';
import { sseService } from '@/features/global/sse/services/SSEService';

interface SSEContextType {
    isConnected: boolean;
}

const SSEContext = createContext<SSEContextType | undefined>(undefined);

export const SSEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const token = useSelector((state: RootState) => state.staffAuth.accessToken);
    const isAuthenticated = !!token;

    useEffect(() => {
        if (isAuthenticated && token) {
            sseService.connect(token);

            const handleConnection = () => setIsConnected(true);
            // const handleDisconnect = () => setIsConnected(false);

            sseService.on('connection_established', handleConnection);
            // We can also listen for errors to set isConnected to false, 
            // but for now, we assume if connect() is called, we are attempting.
            // A better way is to have the service emit connection status changes.

            return () => {
                sseService.off('connection_established', handleConnection);
                sseService.disconnect();
                setIsConnected(false);
            };
        } else {
            sseService.disconnect();
            setIsConnected(false);
        }
    }, [isAuthenticated, token]);

    return (
        <SSEContext.Provider value={{ isConnected }}>
            {children}
        </SSEContext.Provider>
    );
};

export const useSSEContext = () => {
    const context = useContext(SSEContext);
    if (context === undefined) {
        throw new Error('useSSEContext must be used within a SSEProvider');
    }
    return context;
};
