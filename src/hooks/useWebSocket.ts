import { useCallback, useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client, over } from "stompjs";

export interface SeatAvailabilityUpdate {
  tripId: string;
  carId: string;
  seatIds: string[];
  action: "hold" | "release" | "refresh" | "booked" | "book";
  holdUntil?: string;
  by?: string;
}

export interface SeatStatus {
  seatId: string;
  seatNumber: string;
  status: "AVAILABLE" | "RESERVED" | "BOOKED";
  remainingSeconds?: number;
  reservedBy?: string;
  reservedBySession?: string;
}

interface UseWebSocketProps {
  tripId?: string;
  carId?: string;
  onSeatUpdate?: (update: SeatAvailabilityUpdate) => void;
  onError?: (error: string) => void;
}

export const useWebSocket = ({
  tripId,
  carId,
  onSeatUpdate,
  onError,
}: UseWebSocketProps) => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const initializedRef = useRef(false);

  const onSeatUpdateRef = useRef(onSeatUpdate);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSeatUpdateRef.current = onSeatUpdate;
  }, [onSeatUpdate]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (clientRef.current) {
      try {
        clientRef.current.disconnect(() => {
          console.log("WebSocket disconnected");
        });
      } catch (e) {
        // ignore
      }
      clientRef.current = null;
    }
    setConnected(false);
    setConnecting(false);
    initializedRef.current = false;
  }, []);

  const connect = useCallback((): void => {
    if (
      clientRef.current ||
      !tripId ||
      !carId ||
      connected ||
      connecting ||
      initializedRef.current
    )
      return;

    initializedRef.current = true;
    setConnecting(true);
    reconnectAttemptsRef.current = 0;

    try {
      const wsUrl =
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost/api/bookvexe-be-j2e";
      const socket = new SockJS(`${wsUrl}/ws`);
      const stompClient = over(socket);

      stompClient.debug = import.meta.env.DEV
        ? (str: string) => console.log(str)
        : () => {};

      stompClient.connect(
        {},
        () => {
          setConnected(true);
          setConnecting(false);
          reconnectAttemptsRef.current = 0;

          stompClient.subscribe(
            `/topic/seats/${tripId}/${carId}`,
            (message: any) => {
              try {
                const data = JSON.parse(message.body) as SeatAvailabilityUpdate;
                onSeatUpdateRef.current?.(data);
              } catch (error) {
                console.error("Error parsing seat update:", error);
                onErrorRef.current?.("Failed to parse seat update");
              }
            }
          );

          stompClient.subscribe("/user/queue/errors", (message: any) => {
            try {
              const error = JSON.parse(message.body);
              onErrorRef.current?.(error.message || "Unknown error");
            } catch (e) {
              onErrorRef.current?.("An error occurred");
            }
          });

          setTimeout(() => {
            if (onSeatUpdateRef.current) {
              onSeatUpdateRef.current({
                tripId: tripId!,
                carId: carId!,
                seatIds: [],
                action: "refresh" as "hold" | "release",
                by: "system_reconnect",
              });
            }
          }, 500);
        },
        (error: any) => {
          console.error("WebSocket connection error:", error);
          setConnected(false);
          setConnecting(false);

          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(
              500 * Math.pow(1.5, reconnectAttemptsRef.current),
              8000
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              if (!clientRef.current && tripId && carId) {
                setConnecting(false);
                setConnected(false);
                connect();
              }
            }, delay);
          } else {
            onErrorRef.current?.("Failed to connect to real-time updates");
          }
        }
      );

      clientRef.current = stompClient;
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      setConnecting(false);
      onErrorRef.current?.("Failed to initialize WebSocket connection");
    }
  }, [tripId, carId, connected, connecting]);

  const disconnect = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const sendMessage = useCallback(
    (destination: string, body: any) => {
      if (clientRef.current && connected) {
        clientRef.current.send(destination, {}, JSON.stringify(body));
      } else {
        console.warn("WebSocket not connected, cannot send message");
      }
    },
    [connected]
  );

  const reserveSeats = useCallback(
    (
      seatIds: string[],
      userId?: string,
      sessionId?: string,
      minutes: number = 5
    ) => {
      if (!tripId || !carId) return;

      const request = {
        tripId: tripId,
        carId: carId,
        seatIds: seatIds,
        action: "hold",
        holdUntil: new Date(Date.now() + minutes * 60 * 1000).toISOString(),
        by: userId || sessionId,
      };

      sendMessage("/app/seat/hold", request);
    },
    [tripId, carId, sendMessage]
  );

  const releaseSeats = useCallback(
    (seatIds: string[], userId?: string, sessionId?: string) => {
      if (!tripId || !carId) return;

      const request = {
        tripId: tripId,
        carId: carId,
        seatIds: seatIds,
        action: "release",
        by: userId || sessionId,
      };

      sendMessage("/app/seat/release", request);
    },
    [tripId, carId, sendMessage]
  );

  const refreshAvailability = useCallback(() => {
    if (!tripId || !carId) return;
    console.log("Refresh availability called for trip:", tripId, "car:", carId);
  }, [tripId, carId]);

  const connectRef = useRef(connect);
  const cleanupRef = useRef(cleanup);

  useEffect(() => {
    connectRef.current = connect;
    cleanupRef.current = cleanup;
  }, [connect, cleanup]);

  useEffect(() => {
    if (tripId && carId && !initializedRef.current && !clientRef.current) {
      console.log("Initializing WebSocket connection for", tripId, carId);
      connectRef.current();
    }

    return () => {
      if (initializedRef.current) {
        cleanupRef.current();
      }
    };
  }, [tripId, carId]);

  return {
    connected,
    connecting,
    connect,
    disconnect,
    sendMessage,
    reserveSeats,
    releaseSeats,
    refreshAvailability,
  };
};
