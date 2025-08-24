// lib/socket-emitter.ts
import { Server } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents } from "@/types/socket-events";

/**
 * A type-safe event emitter that uses socket.io.
 * It allows us to emit events from anywhere in our application
 * while ensuring the event name and payload are correct.
 */
class SocketEmitter {
  private _io: Server<ClientToServerEvents, ServerToClientEvents> | null = null;

  /**
   * Sets the socket.io server instance.
   * @param io - The socket.io server instance.
   */
  setIo(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this._io = io;
  }

  /**
   * Emits an event to all connected clients.
   * This method is generic and enforces type safety based on the
   * event definitions in ServerToClientEvents.
   * @param event - The name of the event to emit.
   * @param args - The payload for the event.
   */
  emit<E extends keyof ServerToClientEvents>(
    event: E,
    ...args: Parameters<ServerToClientEvents[E]>
  ) {
    if (this._io) {
      // The spread operator (...) is used to pass all payload arguments.
      this._io.emit(event, ...args);
    }
  }
}

// Export a singleton instance of the SocketEmitter.
export const socketEmitter = new SocketEmitter();
