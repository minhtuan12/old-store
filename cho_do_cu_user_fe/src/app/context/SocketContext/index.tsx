"use client";

import { useAuthUser } from "@/hooks/useAuthUser";
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
    onlineUserIds: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<any>(null);
    const [onlineUserIds, setOnlineUserIds] = useState<any>([]);
    const { authUser } = useAuthUser();

    useEffect(() => {
        if (authUser?._id) {
            setSocket(
                io(process.env.NEXT_PUBLIC_API_URL, {
                    query: { user_id: authUser?._id },
                    transports: ["websocket"],
                })
            );

            return () => {
                socket?.disconnect();
            };
        }
    }, [authUser?._id]);

    useEffect(() => {
        if (socket) {
            socket.on("online", (res: any) => {
                setOnlineUserIds(res);
            });
        }
    }, [socket]);

    return (
        <SocketContext.Provider
            value={{ socket: socket, onlineUserIds: onlineUserIds }}
        >
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = (): any => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    const socketData = useMemo(() => {
        return { socket: context.socket, onlineUserIds: context.onlineUserIds };
    }, [context]);

    return socketData;
};
