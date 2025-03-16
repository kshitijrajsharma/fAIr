from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Creates a superuser with the username "admin" if it does not already exist.'

    def handle(self, *args, **options):
        """
        Handle the command to create a superuser.

        This method checks if a superuser with the username "admin" exists.
        If not, it creates one with the username "admin", email "admin@domain.com", and password "admin".
        """
        User = get_user_model()
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser(
                "admin", "admin@domain.com", "admin")
            self.stdout.write(self.style.SUCCESS('Admin user has been created'))
        else:
            self.stdout.write(self.style.SUCCESS('Admin user already exists'))
