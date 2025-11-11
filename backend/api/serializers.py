from rest_framework import serializers
from .models import Task, TaskLog
from django.utils import timezone

class TaskLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskLog
        fields = ['id', 'action', 'timestamp', 'details']

class TaskSerializer(serializers.ModelSerializer):
    logs = TaskLogSerializer(many=True, read_only=True)
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'completed', 'priority', 
                 'due_date', 'created_at', 'updated_at', 'logs', 'is_overdue']

    def validate_due_date(self, value):
        if value and value < timezone.now():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value