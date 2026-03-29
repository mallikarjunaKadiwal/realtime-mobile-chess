import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer

# Dictionary to track player counts per room: { 'room_1234': 0, 'room_5678': 1 }
room_player_counts = {}

class ChessConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # 1. Grab the room name from the URL
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chess_{self.room_name}'

        # 2. Join that specific room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # 3. Handle player color assignment for THIS specific room
        await asyncio.sleep(0.5) 
        
        count = room_player_counts.get(self.room_group_name, 0)
        if count == 0:
            self.player_color = 'w'
        elif count == 1:
            self.player_color = 'b'
        else:
            self.player_color = 'observer' # 3rd+ person is just watching

        room_player_counts[self.room_group_name] = count + 1

        await self.send(text_data=json.dumps({
            'action': 'assign_color',
            'color': self.player_color
        }))
        print(f"Room {self.room_name}: Assigned {self.player_color}")

    async def disconnect(self, close_code):
        # Reduce count for this specific room
        count = room_player_counts.get(self.room_group_name, 1)
        room_player_counts[self.room_group_name] = max(0, count - 1)
        
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('action') == 'move':
            # ONLY broadcast to people in the SAME room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_move',
                    'from': data['from'],
                    'to': data['to'],
                    'fen': data['fen']
                }
            )

    async def broadcast_move(self, event):
        await self.send(text_data=json.dumps({
            'action': 'move',
            'from': event['from'],
            'to': event['to'],
            'fen': event['fen']
        }))