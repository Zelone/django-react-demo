from django.core.management.base import BaseCommand
from django.db import connection
from django.utils import timezone

class Command(BaseCommand):
    help = 'Test database connection and performance'

    def handle(self, *args, **options):
        self.stdout.write('Testing database connection...')
        
        # Test connection
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT version()")
                version = cursor.fetchone()
                self.stdout.write(self.style.SUCCESS(f'✓ PostgreSQL Version: {version[0]}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Database connection failed: {e}'))
            return

        # Test performance with sample query
        start_time = timezone.now()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT count(*) FROM information_schema.tables 
                WHERE table_schema = 'public'
            """)
            table_count = cursor.fetchone()[0]
        
        duration = (timezone.now() - start_time).total_seconds()
        self.stdout.write(self.style.SUCCESS(f'✓ Database response time: {duration:.3f}s'))
        self.stdout.write(self.style.SUCCESS(f'✓ Tables in database: {table_count}'))