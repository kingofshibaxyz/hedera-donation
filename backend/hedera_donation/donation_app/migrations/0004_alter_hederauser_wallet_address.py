# Generated by Django 4.2.17 on 2024-12-05 10:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("donation_app", "0003_alter_hederauser_email_alter_hederauser_username"),
    ]

    operations = [
        migrations.AlterField(
            model_name="hederauser",
            name="wallet_address",
            field=models.CharField(max_length=255),
        ),
    ]
