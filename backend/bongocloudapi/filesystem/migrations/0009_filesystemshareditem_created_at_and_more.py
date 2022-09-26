# Generated by Django 4.1.1 on 2022-09-26 12:15

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('filesystem', '0008_remove_filesystemitem_allow_any'),
    ]

    operations = [
        migrations.AddField(
            model_name='filesystemshareditem',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=datetime.datetime(2022, 9, 26, 12, 15, 46, 468373, tzinfo=datetime.timezone.utc)),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='filesystemshareditem',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]