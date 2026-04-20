
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta

from .models import Item, Category, Location, ClaimRequest
from .serializers import (
    ItemSerializer, CategorySerializer, LocationSerializer,
    ClaimRequestSerializer, RegisterSerializer, ItemSearchSerializer
)


# ════════════════════════════════════════════════
# FBV 1 — Register
# ════════════════════════════════════════════════
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Registered successfully.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ════════════════════════════════════════════════
# FBV 2 — Search / Filter Items
# ════════════════════════════════════════════════
@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
def search_items(request):
    param_serializer = ItemSearchSerializer(data=request.query_params)
    if not param_serializer.is_valid():
        return Response(param_serializer.errors, status=400)

    qs = Item.active.all()
    data = param_serializer.validated_data

    if data.get('query'):
        qs = qs.filter(title__icontains=data['query']) | qs.filter(description__icontains=data['query'])
    if data.get('category'):
        qs = qs.filter(category_id=data['category'])
    if data.get('location'):
        qs = qs.filter(location_id=data['location'])
    if data.get('status'):
        qs = qs.filter(status=data['status'])

    serializer = ItemSerializer(qs.order_by('-date_posted'), many=True)
    return Response(serializer.data)


# ════════════════════════════════════════════════
# CBV 1 — Item List + Create (full CRUD starts here)
# ════════════════════════════════════════════════
class ItemListCreateView(APIView):
    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        """List all items (or only user's own if ?mine=true)"""
        if request.query_params.get('mine'):
            items = Item.objects.filter(posted_by=request.user).order_by('-date_posted')
        else:
            items = Item.active.all().order_by('-date_posted')
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new item, linked to authenticated user."""
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(posted_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MyItemsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = Item.objects.filter(posted_by=request.user).order_by('-date_posted')
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)


# ════════════════════════════════════════════════
# CBV 2 — Item Detail: Retrieve, Update, Delete
# ════════════════════════════════════════════════
class ItemDetailView(APIView):
    def get_authenticators(self):
        if self.request.method == 'GET':
            return []
        return super().get_authenticators()

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_object(self, pk):
        return get_object_or_404(Item, pk=pk)

    def get(self, request, pk):
        item = self.get_object(pk)
        serializer = ItemSerializer(item)
        return Response(serializer.data)

    def put(self, request, pk):
        item = self.get_object(pk)
        if item.posted_by != request.user:
            return Response({'error': 'Not authorized.'}, status=403)
        serializer = ItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        item = self.get_object(pk)
        if item.posted_by != request.user:
            return Response({'error': 'Not authorized.'}, status=403)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MarkItemClaimedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        item = get_object_or_404(Item, pk=pk)
        if item.posted_by != request.user:
            return Response({'error': 'Only the item owner can mark it as claimed.'}, status=403)

        item.is_claimed = True
        item.claimed_at = timezone.now()
        item.save(update_fields=['is_claimed', 'claimed_at'])
        return Response({'message': 'Item marked as claimed. It will disappear from public feed in 1 hour.'})


# ════════════════════════════════════════════════
# Claim Requests — list & create
# ════════════════════════════════════════════════
class ClaimRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """User sees their own claims."""
        claims = ClaimRequest.objects.filter(requested_by=request.user)
        serializer = ClaimRequestSerializer(claims, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ClaimRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(requested_by=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# ════════════════════════════════════════════════
# Categories & Locations (simple list views)
# ════════════════════════════════════════════════
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def category_list(request):
    if request.method == 'GET':
        cats = Category.objects.all()
        return Response(CategorySerializer(cats, many=True).data)
    serializer = CategorySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def location_list(request):
    if request.method == 'GET':
        locs = Location.objects.all()
        return Response(LocationSerializer(locs, many=True).data)
    serializer = LocationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

class UserItemsView(generics.ListAPIView):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

<<<<<<< HEAD
    def get_queryset(self):
        return Item.objects.filter(author=self.request.user)
=======
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def bootstrap_reference_data(request):
    """Create default categories and locations (idempotent)."""
    category_names = [
        'Electronics',
        'Documents',
        'Keys',
        'Bags',
        'Clothing',
        'Accessories',
        'Books & Notes',
        'Other',
    ]
    for name in category_names:
        Category.objects.get_or_create(name=name)

    buildings = ['Tole Bi', 'Kazybek Bi', 'Panfilova', 'Abylay Khana']
    for building in buildings:
        for floor in range(1, 6):
            Location.objects.get_or_create(
                name=building,
                building='KBTU Campus',
                floor=str(floor),
            )

    if Item.objects.count() == 0:
        demo_user, _ = User.objects.get_or_create(
            username='demo_user',
            defaults={'email': 'demo@kbtu.kz'}
        )
        if not demo_user.has_usable_password():
            demo_user.set_password('demo12345')
            demo_user.save(update_fields=['password'])

        demo_category = Category.objects.filter(name='Electronics').first() or Category.objects.first()
        demo_location = Location.objects.filter(name='Tole Bi', floor='2').first() or Location.objects.first()

        if demo_category and demo_location:
            Item.objects.create(
                title='Apple AirPods Case',
                description='White AirPods case found near Tole Bi staircase.',
                status='found',
                category=demo_category,
                location=demo_location,
                posted_by=demo_user,
                date_occurred=timezone.now().date() - timedelta(days=1),
            )
            Item.objects.create(
                title='Black Wallet',
                description='Lost black wallet with student card, possibly near Panfilova floor 4.',
                status='lost',
                category=Category.objects.filter(name='Personal Items').first() or demo_category,
                location=Location.objects.filter(name='Panfilova', floor='4').first() or demo_location,
                posted_by=demo_user,
                date_occurred=timezone.now().date(),
            )

    return Response({
        'message': 'Reference data is ready.',
        'categories_count': Category.objects.count(),
        'locations_count': Location.objects.count(),
    }, status=200)


>>>>>>> eb8026e (some fixes)
# ════════════════════════════════════════════════
# Logout (blacklist refresh token)
# ════════════════════════════════════════════════
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        token = RefreshToken(request.data.get('refresh'))
        token.blacklist()
    except Exception:
        pass
    return Response({'message': 'Logged out.'})