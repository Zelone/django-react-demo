from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, health_check

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('health/', health_check),
]