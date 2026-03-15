import React, { createContext, useContext, useEffect, useState } from 'react';
import { websocketService } from '@/services/websocket';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (destination: string, handler: (message: unknown) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  subscribe: () => () => {},
});

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        websocketService
          .connect(token)
          .then(() => setIsConnected(true))
          .catch((err) => console.error('WebSocket connection failed:', err));
      }
    } else {
      websocketService.disconnect();
      setIsConnected(false);
    }

    return () => {
      websocketService.disconnect();
      setIsConnected(false);
    };
  }, [isAuthenticated]);

  const subscribe = (destination: string, handler: (message: unknown) => void) => {
    return websocketService.subscribe(destination, handler);
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
