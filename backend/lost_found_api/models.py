from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Location(models.Model):
    name = models.CharField(max_length=100, unique=True)
    building = models.CharField(max_length=100, blank=True)
    floor = models.CharField(max_length=20, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ActiveItemManager(models.Manager):
    """Custom manager — returns only open (unclaimed) items."""
    def get_queryset(self):
        return super().get_queryset().filter(status='open')

    def by_location(self, location_name):
        return self.get_queryset().filter(location__name=location_name)


class Item(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('claimed', 'Claimed'),
        ('closed', 'Closed'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='items')
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, related_name='items')
    found_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_items')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    date_found = models.DateField()
    image = models.ImageField(upload_to='item_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Default + custom managers
    objects = models.Manager()
    active = ActiveItemManager()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} @ {self.location}"


class ClaimRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='claim_requests')
    claimed_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claim_requests')
    message = models.TextField(help_text='Describe why this item belongs to you.')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('item', 'claimed_by')

    def __str__(self):
        return f"{self.claimed_by.username} → {self.item.name}"


class ChatMessage(models.Model):
    """Campus-wide chat messages."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.user.username}: {self.message[:40]}"
