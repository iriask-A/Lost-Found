from django.urls import path
from .views.item_views import (
    item_list_create, create_item, search_items, my_items,
    ItemDetailView, CategoryListView, LocationListView,
)
from .views.claim_views import (
    submit_claim, resolve_claim, MyClaims, ItemClaims,
)

urlpatterns = [
    # Items
    path('items/', item_list_create, name='item-list'),
    path('items/create/', create_item, name='item-create'),
    path('items/search/', search_items, name='item-search'),
    path('items/mine/', my_items, name='my-items'),
    path('items/<int:pk>/', ItemDetailView.as_view(), name='item-detail'),

    # Categories & Locations
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('locations/', LocationListView.as_view(), name='location-list'),

    # Claims
    path('items/<int:item_id>/claim/', submit_claim, name='submit-claim'),
    path('items/<int:item_id>/claims/', ItemClaims.as_view(), name='item-claims'),
    path('claims/', MyClaims.as_view(), name='my-claims'),
    path('claims/<int:claim_id>/', MyClaims.as_view(), name='withdraw-claim'),
    path('claims/<int:claim_id>/resolve/', resolve_claim, name='resolve-claim'),
]
