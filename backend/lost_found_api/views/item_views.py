from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from ..models import Item, Category, Location
from ..serializers import ItemSerializer, CategorySerializer, LocationSerializer


# ── Function-Based Views (requirement: at least 2) ──────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def item_list_create(request):
    """FBV — GET all items (with filters) or POST a new item."""
    if request.method == 'GET':
        items = Item.objects.select_related('category', 'location', 'found_by').all()

        # Filter by location
        location = request.query_params.get('location')
        if location:
            items = items.filter(location__name__icontains=location)

        # Filter by category
        category = request.query_params.get('category')
        if category:
            items = items.filter(category__name__icontains=category)

        # Filter by status
        item_status = request.query_params.get('status')
        if item_status:
            items = items.filter(status=item_status)

        # Search by name/description
        search = request.query_params.get('search')
        if search:
            items = items.filter(name__icontains=search) | items.filter(description__icontains=search)

        serializer = ItemSerializer(items, many=True, context={'request': request})
        return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_item(request):
    """FBV — POST a new found item, linked to request.user."""
    serializer = ItemSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticatedOrReadOnly])
def search_items(request):
    """FBV — Search items by query param."""
    query = request.query_params.get('q', '')
    if not query:
        return Response({'error': 'Query parameter q is required.'}, status=400)

    items = Item.objects.filter(name__icontains=query) | \
            Item.objects.filter(description__icontains=query)
    serializer = ItemSerializer(items, many=True, context={'request': request})
    return Response({'results': serializer.data, 'count': items.count()})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_items(request):
    """FBV — Get items reported by the logged-in user."""
    items = Item.objects.filter(found_by=request.user).select_related('category', 'location')
    serializer = ItemSerializer(items, many=True, context={'request': request})
    return Response(serializer.data)


# ── Class-Based Views (requirement: at least 2) ─────────────────────────────

class ItemDetailView(APIView):
    """CBV — GET, PUT, DELETE a single item."""
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_object(self, pk):
        return get_object_or_404(Item, pk=pk)

    def get(self, request, pk):
        item = self.get_object(pk)
        serializer = ItemSerializer(item, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        item = self.get_object(pk)
        if item.found_by != request.user:
            return Response({'error': 'You can only edit your own reports.'}, status=403)
        serializer = ItemSerializer(item, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        item = self.get_object(pk)
        if item.found_by != request.user:
            return Response({'error': 'You can only delete your own reports.'}, status=403)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CategoryListView(APIView):
    """CBV — GET all categories or POST a new one."""
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LocationListView(APIView):
    """CBV — GET all locations or POST a new one."""
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        locations = Location.objects.all()
        serializer = LocationSerializer(locations, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = LocationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
