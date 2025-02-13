# Generated by Django 4.2.17 on 2024-12-05 06:30

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("donation_app", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="HederaUser",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("username", models.CharField(max_length=150, unique=True)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("is_active", models.BooleanField(default=True)),
                ("date_joined", models.DateTimeField(auto_now_add=True)),
                (
                    "wallet_address",
                    models.CharField(blank=True, max_length=255, null=True),
                ),
            ],
        ),
        migrations.RemoveField(
            model_name="userprofile",
            name="wallet_address",
        ),
        migrations.AlterField(
            model_name="campaign",
            name="organizer",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="campaigns",
                to="donation_app.hederauser",
            ),
        ),
        migrations.AlterField(
            model_name="donation",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="donations",
                to="donation_app.hederauser",
            ),
        ),
        migrations.AlterField(
            model_name="donationhistory",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="donation_histories",
                to="donation_app.hederauser",
            ),
        ),
        migrations.AlterField(
            model_name="userprofile",
            name="user",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="profile",
                to="donation_app.hederauser",
            ),
        ),
    ]
