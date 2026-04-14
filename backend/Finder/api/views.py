from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404

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
def search_items(request):
    param_serializer = ItemSearchSerializer(data=request.query_params)
    if not param_serializer.is_valid():
        return Response(param_serializer.errors, status=400)

    qs = Item.objects.all()
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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all items (or only user's own if ?mine=true)"""
        if request.query_params.get('mine'):
            items = Item.objects.filter(posted_by=request.user).order_by('-date_posted')
        else:
            items = Item.objects.all().order_by('-date_posted')
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new item, linked to authenticated user."""
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(posted_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ════════════════════════════════════════════════
# CBV 2 — Item Detail: Retrieve, Update, Delete
# ════════════════════════════════════════════════
class ItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

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
def location_list(request):
    if request.method == 'GET':
        locs = Location.objects.all()
        return Response(LocationSerializer(locs, many=True).data)
    serializer = LocationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


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