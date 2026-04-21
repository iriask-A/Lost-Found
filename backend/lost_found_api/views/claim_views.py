from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..models import ClaimRequest, Item
from ..serializers import ClaimRequestSerializer, ClaimActionSerializer


# ── FBV ─────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_claim(request, item_id):
    """FBV — Submit a claim request for an item."""
    item = get_object_or_404(Item, pk=item_id)

    # Prevent claiming own item
    if item.found_by == request.user:
        return Response({'error': "You can't claim an item you reported."}, status=400)

    # Prevent duplicate claim
    if ClaimRequest.objects.filter(item=item, claimed_by=request.user).exists():
        return Response({'error': 'You already submitted a claim for this item.'}, status=400)

    data = request.data.copy()
    data['item_id'] = item_id
    serializer = ClaimRequestSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        claim = serializer.save()
        return Response(ClaimRequestSerializer(claim).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resolve_claim(request, claim_id):
    """FBV — Approve or reject a claim (only item reporter can do this)."""
    claim = get_object_or_404(ClaimRequest, pk=claim_id)

    if claim.item.found_by != request.user:
        return Response({'error': 'Only the item reporter can resolve claims.'}, status=403)

    serializer = ClaimActionSerializer(data=request.data)
    if serializer.is_valid():
        action = serializer.validated_data['action']
        claim.status = action
        claim.save()

        if action == 'approved':
            claim.item.status = 'closed'
            claim.item.save()
            # Reject all other pending claims
            ClaimRequest.objects.filter(item=claim.item).exclude(pk=claim.pk).update(status='rejected')

        return Response({'message': f'Claim {action}.', 'claim_id': claim.pk})
    return Response(serializer.errors, status=400)


# ── CBV ──────────────────────────────────────────────────────────────────────

class MyClaims(APIView):
    """CBV — List and manage the authenticated user's claims."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        claims = ClaimRequest.objects.filter(claimed_by=request.user).select_related('item')
        serializer = ClaimRequestSerializer(claims, many=True)
        return Response(serializer.data)

    def delete(self, request, claim_id=None):
        """Withdraw a pending claim."""
        claim = get_object_or_404(ClaimRequest, pk=claim_id, claimed_by=request.user)
        if claim.status != 'pending':
            return Response({'error': 'Only pending claims can be withdrawn.'}, status=400)
        # Reopen the item
        claim.item.status = 'open'
        claim.item.save()
        claim.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ItemClaims(APIView):
    """CBV — Get all claims for a specific item (only visible to item reporter)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, item_id):
        item = get_object_or_404(Item, pk=item_id)
        if item.found_by != request.user:
            return Response({'error': 'Access denied.'}, status=403)
        claims = ClaimRequest.objects.filter(item=item).select_related('claimed_by')
        serializer = ClaimRequestSerializer(claims, many=True)
        return Response(serializer.data)
