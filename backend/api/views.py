from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db import connection
from django.utils import timezone
from .models import Task, TaskLog
from .serializers import TaskSerializer, TaskLogSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer

    def perform_create(self, serializer):
        task = serializer.save()
        TaskLog.objects.create(
            task=task,
            action='created',
            details={'title': task.title}
        )

    def perform_update(self, serializer):
        task = serializer.save()
        TaskLog.objects.create(
            task=task,
            action='updated',
            details={'changes': serializer.validated_data}
        )

    @action(detail=True, methods=['post'])
    def toggle_complete(self, request, pk=None):
        task = self.get_object()
        task.completed = not task.completed
        task.save()
        
        action_type = 'completed' if task.completed else 'reopened'
        TaskLog.objects.create(
            task=task,
            action=action_type,
            details={'completed': task.completed}
        )
        
        return Response({'status': 'toggled', 'completed': task.completed})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        stats = {
            'total_tasks': Task.objects.count(),
            'completed_tasks': Task.objects.filter(completed=True).count(),
            'high_priority_tasks': Task.objects.filter(priority=3).count(),
            'overdue_tasks': Task.objects.filter(
                due_date__lt=timezone.now(),
                completed=False
            ).count(),
        }
        return Response(stats)

@api_view(['GET'])
def health_check(request):
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_status = 'connected'
    except Exception as e:
        db_status = f'error: {str(e)}'

    return Response({
        'status': 'healthy',
        'service': 'django-backend',
        'database': db_status,
        'timestamp': timezone.now().isoformat()
    })