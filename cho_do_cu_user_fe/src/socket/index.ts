import io from 'socket.io-client'

class SocketService {
    private socket: any = null

    constructor() {
        this.socket = null
    }

    initSocket(userId: string) {
        this.socket = io(process.env.NEXT_PUBLIC_API_URL, {query: {user_id: userId}})
    }

    getSocket(userId: string) {
        if (!this.socket) {
            this.initSocket(userId)
        }
        return this.socket
    }

    disconnectSocket() {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }

    createNewSocket(userId: string) {
        this.disconnectSocket()
        this.initSocket(userId)
    }
}

const socketService = new SocketService()

export default socketService
