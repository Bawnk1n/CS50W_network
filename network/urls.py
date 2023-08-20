
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path('like/', views.like, name='like_post'),
    path('profile/<int:user_id>', views.profile, name='profile-page'),
    path('profile/follow/', views.follow, name='follow'),
    path('following/', views.following, name='following')
]
