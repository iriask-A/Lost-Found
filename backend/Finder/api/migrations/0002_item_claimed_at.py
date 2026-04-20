from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='item',
            name='claimed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
