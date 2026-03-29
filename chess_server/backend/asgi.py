import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Initialize standard Django ASGI application early
django_asgi_app = get_asgi_application()

import game.routing # We will create this file in a moment

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": URLRouter(
        game.routing.websocket_urlpatterns
    ),
})