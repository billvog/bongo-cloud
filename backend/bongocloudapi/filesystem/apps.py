from django.apps import AppConfig


class FilesystemConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'filesystem'
    def ready(self) -> None:
        import filesystem.signals
        return super().ready()
