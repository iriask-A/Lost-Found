
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.register_view, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', views.logout_view, name='logout'),

    # Items — CRUD
    path('items/', views.ItemListCreateView.as_view(), name='item-list-create'),
    path('items/my/', views.UserItemsView.as_view(), name='user-items'),
    path('items/<int:pk>/', views.ItemDetailView.as_view(), name='item-detail'),
    path('items/search/', views.search_items, name='item-search'),

    # Supporting data
    path('categories/', views.category_list, name='categories'),
    path('locations/', views.location_list, name='locations'),

    # Claims
    path('claims/', views.ClaimRequestView.as_view(), name='claims'),
]