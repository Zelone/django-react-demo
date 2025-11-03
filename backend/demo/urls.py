from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def home(request):
    return JsonResponse({
        'message': 'Django React Demo API',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'tasks': '/api/tasks/'
        }
    })

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]