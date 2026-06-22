import { io, Socket } from 'socket.io-client';
import { ThreatRecord } from '../types/index.js';

let socket: Socket | null = null;

export function initializeSocket(): Socket {
  if (socket) return socket;
  socket = io('http://localhost:4000', {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function onNewThreat(callback: (threat: ThreatRecord) => void) {
  const sock = initializeSocket();
  sock.on('newThreat', callback);
  return () => sock.off('newThreat', callback);
}

export function closeSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
