# Generated by Django 4.1.1 on 2022-09-16 11:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('filesystem', '0003_filesystemitem_created_at_filesystemitem_updated_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='filesystemitem',
            name='allow_any',
            field=models.BooleanField(default=False),
        ),
    ]