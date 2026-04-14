from django.db import models
from django.contrib.auth.models import User


class ActiveItemManager(models.Manager):
    """Custom model manager — returns only active (unclaimed) items."""
    def get_queryset(self):
        return super().get_queryset().filter(is_claimed=False)


class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'


class Location(models.Model):
    name = models.CharField(max_length=100)
    building = models.CharField(max_length=100, blank=True)
    floor = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.name} ({self.building})"


class Item(models.Model):
    STATUS_CHOICES = [
        ('lost', 'Lost'),
        ('found', 'Found'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='found')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='items')   # ForeignKey 1
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, related_name='items')   # ForeignKey 2
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='items')
    image = models.ImageField(upload_to='items/', blank=True, null=True)
    is_claimed = models.BooleanField(default=False)
    date_posted = models.DateTimeField(auto_now_add=True)
    date_occurred = models.DateField(null=True, blank=True)

    # Default manager (all items)
    objects = models.Manager()
    # Custom manager (only unclaimed items)
    active = ActiveItemManager()

    def __str__(self):
        return f"[{self.status.upper()}] {self.title}"


class ClaimRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='claims')
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claim_requests')
    message = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Claim by {self.requested_by.username} on {self.item.title}"