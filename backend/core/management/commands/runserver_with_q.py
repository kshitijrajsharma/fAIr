import multiprocessing
import os

from django.core.management import call_command
from django.core.management.commands.runserver import Command as RunserverCommand


class Command(RunserverCommand):
    """
    Custom command to run the Django development server along with Django Q cluster.
    """

    def handle(self, *args, **options):
        """
        Handle the command to run the Django development server.

        This method starts a separate process to run the Django Q cluster
        and then starts the Django development server.

        Args:
            *args: Variable length argument list.
            **options: Arbitrary keyword arguments.
        """
        multiprocessing.Process(target=self.start_django_q).start()
        super().handle(*args, **options)

    def start_django_q(self):
        """
        Start the Django Q cluster.

        This method calls the 'qcluster' management command to start the Django Q cluster.
        """
        call_command("qcluster")
