from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # This regex captures any alphanumeric room name
    re_path(r'ws/chess/(?P<room_name>\w+)/$', consumers.ChessConsumer.as_asgi()),
]