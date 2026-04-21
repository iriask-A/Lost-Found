from django.contrib import admin
from .models import Category, Location, Item, ClaimRequest

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'building', 'floor']

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'location', 'found_by', 'status', 'date_found']
    list_filter = ['status', 'category', 'location']
    search_fields = ['name', 'description']

@admin.register(ClaimRequest)
class ClaimRequestAdmin(admin.ModelAdmin):
    list_display = ['item', 'claimed_by', 'status', 'created_at']
    list_filter = ['status']
