from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer

@api_view(['GET'])
def health_check(request):
    return Response({
        'status': 'healthy',
        'service': 'django-backend',
        'timestamp': '2024-01-01T00:00:00Z'  # In real app, use timezone.now()
    })