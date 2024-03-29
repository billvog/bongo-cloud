# Generated by Django 4.1.1 on 2022-09-24 10:35

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('filesystem', '0005_filesystemitem_path'),
    ]

    operations = [
        migrations.CreateModel(
            name='FilesystemSharedItem',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('has_password', models.BooleanField(default=False)),
                ('password', models.CharField(blank=True, max_length=100, null=True)),
                ('does_expire', models.BooleanField(default=False)),
                ('expiry', models.DateTimeField(blank=True, null=True)),
                ('allowed_users', models.ManyToManyField(to=settings.AUTH_USER_MODEL)),
                ('item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='filesystem.filesystemitem')),
            ],
        ),
    ]
