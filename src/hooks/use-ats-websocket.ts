const WS_URL = 'ws://127.0.0.1:8000/ws/ats';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

type MessageType = 'candidateAssigned' | 'feedbackSubmitted';

interface ATSMessage {
  type: MessageType;
  timestamp?: number;
}

export const sendATSMessage = (type: MessageType) => {
  try {
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log(`[WebSocket] Sending ${type} message`);
      ws.send(JSON.stringify({ type, timestamp: Date.now() }));
      setTimeout(() => ws.close(), 100);
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Send error:', error);
    };
  } catch (error) {
    console.error('[WebSocket] Error sending message:', error);
  }
};
