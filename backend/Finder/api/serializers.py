from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Item, Category, Location, ClaimRequest


# ── serializers.Serializer (manual) ──────────────────────────────────────────

class RegisterSerializer(serializers.Serializer):
    """Manual Serializer for user registration."""
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("Username already taken.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class ItemSearchSerializer(serializers.Serializer):
    """Manual Serializer for search/filter query params."""
    query = serializers.CharField(required=False, allow_blank=True)
    category = serializers.IntegerField(required=False)
    location = serializers.IntegerField(required=False)
    status = serializers.ChoiceField(choices=['lost', 'found', ''], required=False, allow_blank=True)


# ── serializers.ModelSerializer ───────────────────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'


class ItemSerializer(serializers.ModelSerializer):
    posted_by_username = serializers.CharField(source='posted_by.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    location_name = serializers.SerializerMethodField()

    def get_location_name(self, obj):
        if not obj.location:
            return ''
        if obj.location.floor:
            return f"{obj.location.name} - Floor {obj.location.floor}"
        return obj.location.name

    class Meta:
        model = Item
        fields = [
            'id', 'title', 'description', 'status',
            'category', 'category_name',
            'location', 'location_name',
            'posted_by', 'posted_by_username',
            'image', 'is_claimed', 'claimed_at', 'date_posted', 'date_occurred'
        ]
        read_only_fields = ['posted_by', 'date_posted', 'claimed_at']


class ClaimRequestSerializer(serializers.ModelSerializer):
    requested_by_username = serializers.CharField(source='requested_by.username', read_only=True)
    item_title = serializers.CharField(source='item.title', read_only=True)

    class Meta:
        model = ClaimRequest
        fields = ['id', 'item', 'item_title', 'requested_by', 'requested_by_username',
                  'message', 'status', 'created_at']
        read_only_fields = ['requested_by', 'status', 'created_at']