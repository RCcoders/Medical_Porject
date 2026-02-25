from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json

router = APIRouter(
    prefix="/ws",
    tags=["video-call"]
)

class ConnectionManager:
    def __init__(self):
        # Store active connections: room_id -> list of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Personal notification connections: user_id -> WebSocket
        self.notifications: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    async def connect_notification(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.notifications[user_id] = websocket

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    def disconnect_notification(self, user_id: str):
        if user_id in self.notifications:
            del self.notifications[user_id]

    async def broadcast_to_others(self, message: str, sender: WebSocket, room_id: str):
        # Send message to all connections in the room except the sender
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != sender:
                    await connection.send_text(message)

    async def notify_user(self, user_id: str, message: str):
        if user_id in self.notifications:
            await self.notifications[user_id].send_text(message)

manager = ConnectionManager()

@router.websocket("/call/{room_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    await manager.connect(websocket, room_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Special handling for medical signaling events
            event_type = message.get("type")
            
            if event_type == "CALL_INITIATED":
                # Maybe update appointment status in DB (though better via REST)
                pass
            
            # Relay the message to the other peer in the room
            await manager.broadcast_to_others(data, websocket, room_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        # Notify others with a structured event
        await manager.broadcast_to_others(json.dumps({
            "type": "USER_LEFT",
            "userId": user_id,
            "roomId": room_id
        }), websocket, room_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, room_id)

@router.websocket("/notifications/{user_id}")
async def notification_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect_notification(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # If doc sends a "CALL_INITIATED" here, it should be routed to the specific patient
            if message.get("type") == "CALL_INITIATED":
                target_id = message.get("patient_id")
                if target_id:
                    await manager.notify_user(str(target_id), data)
            
    except WebSocketDisconnect:
        manager.disconnect_notification(user_id)
