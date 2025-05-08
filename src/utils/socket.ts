// socket.ts
import { io, Socket } from 'socket.io-client';

interface ServerToClientEvents {
  'server-response': (data: any) => void;
}

interface ClientToServerEvents {
  'custom-event': (payload: { message: string }) => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export function setupSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
  const token = sessionStorage.getItem('access_token') || '';
  const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null;

  socket = io('http://localhost:3002', {
    auth: {
      token,
      userId: user?._id || '',
    },
  });

  socket.on('connect', () => {
    console.log(`✅ Connected to WS server as: ${socket?.id}`);
  });

  socket.on('connect_error', (err) => {
    console.error('❌ Socket connection error:', err.message);
  });

  return socket;
}

export function getSocket(): typeof socket {
  return socket;
}
