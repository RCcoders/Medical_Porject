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

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast_to_others(self, message: str, sender: WebSocket, room_id: str):
        # Send message to all connections in the room except the sender
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                if connection != sender:
                    await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/call/{room_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, user_id: str):
    await manager.connect(websocket, room_id)
    try:
        # Notify others in the room that a user has joined
        # await manager.broadcast_to_others(json.dumps({"type": "user-joined", "userId": user_id}), websocket, room_id)
        
        while True:
            data = await websocket.receive_text()
            # Relay the message to the other peer in the room
            await manager.broadcast_to_others(data, websocket, room_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        # Notify others that user left
        await manager.broadcast_to_others(json.dumps({"type": "user-left", "userId": user_id}), websocket, room_id)
