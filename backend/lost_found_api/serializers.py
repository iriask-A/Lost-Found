from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Location, Item, ClaimRequest


# ── Plain serializers.Serializer (requirement: at least 2) ──────────────────

class RegisterSerializer(serializers.Serializer):
    """Plain Serializer for user registration."""
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    first_name = serializers.CharField(max_length=100, required=False, default='')
    last_name = serializers.CharField(max_length=100, required=False, default='')

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already taken.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class ClaimActionSerializer(serializers.Serializer):
    """Plain Serializer to approve or reject a claim (used in FBV)."""
    action = serializers.ChoiceField(choices=['approved', 'rejected'])
    reason = serializers.CharField(required=False, allow_blank=True)

    def validate_action(self, value):
        if value not in ['approved', 'rejected']:
            raise serializers.ValidationError('Action must be approved or rejected.')
        return value


# ── ModelSerializer (requirement: at least 2) ────────────────────────────────

class CategorySerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'item_count', 'created_at']

    def get_item_count(self, obj):
        return obj.items.count()


class LocationSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ['id', 'name', 'building', 'floor', 'item_count']

    def get_item_count(self, obj):
        return obj.items.filter(status='open').count()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class ItemSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    found_by = UserSerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source='location', write_only=True
    )
    claim_count = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            'id', 'name', 'description', 'category', 'category_id',
            'location', 'location_id', 'found_by', 'status',
            'date_found', 'image', 'claim_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['found_by', 'status', 'created_at', 'updated_at']

    def get_claim_count(self, obj):
        return obj.claim_requests.count()

    def create(self, validated_data):
        # Link item to authenticated user
        validated_data['found_by'] = self.context['request'].user
        return super().create(validated_data)


class ClaimRequestSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(), source='item', write_only=True
    )
    claimed_by = UserSerializer(read_only=True)

    class Meta:
        model = ClaimRequest
        fields = ['id', 'item', 'item_id', 'claimed_by', 'message', 'status', 'created_at']
        read_only_fields = ['claimed_by', 'status', 'created_at']

    def validate_item_id(self, value):
        if value.status != 'open':
            raise serializers.ValidationError('This item is no longer available for claiming.')
        return value

    def create(self, validated_data):
        validated_data['claimed_by'] = self.context['request'].user
        claim = super().create(validated_data)
        # Mark item as claimed
        claim.item.status = 'claimed'
        claim.item.save()
        return claim
