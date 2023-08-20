from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
import json
import math

from .models import User, Post, Like, Follower, Reply


def index(request):
    if request.method == 'GET':
        posts = Post.objects.prefetch_related('likes').all().order_by('timestamp').reverse()
        context = {}
        if request.user.is_authenticated:
            user_likes = [like.post_id for like in Like.objects.filter(user=request.user)]
            context['user_likes']= user_likes
        indexed_posts = []
        #create indices for each post for page functionality
        for index, post in enumerate(posts, start=1):
            indexed_posts.append({'index': index, 'post':post})
        context['posts'] = indexed_posts
        return render(request, "network/index.html", context)
    elif request.method =='POST':
        new_post = request.POST.get('post_content')
        user = request.user
        if new_post:
            Post.objects.create(user = user, content=new_post, timestamp=timezone.now())
        posts = Post.objects.prefetch_related('likes').all().order_by('timestamp').reverse()
        user_likes = [like.post_id for like in Like.objects.filter(user=request.user)]
        context ={}
        indexed_posts = []
        #create indices for each post for page functionality
        for index, post in enumerate(posts, start=1):
            indexed_posts.append({'index': index, 'post':post})
        context['posts'] = indexed_posts
        context['user_likes'] = user_likes
        return render(request, "network/index.html", context)
    
    elif request.method == 'PUT':
        #About to make functionality for editing a post
        data =  json.loads(request.body.decode('utf-8'))
        updated_post = data.get('post_content')
        post_id = data.get('post_id')
        if updated_post and post_id:
            try:
                post = Post.objects.get(pk = post_id)
                post.content = updated_post
                post.save()
            except Post.DoesNotExist:
                return HttpResponse('Something went wrong')
            
        #create context to pass into page
        posts = Post.objects.prefetch_related('likes').all().order_by('timestamp').reverse()
        context = {}
        if request.user.is_authenticated:
            user_likes = [like.post_id for like in Like.objects.filter(user=request.user)]
            context['user_likes']= user_likes
        indexed_posts = []
        #create indices for each post for page functionality
        for index, post in enumerate(posts, start=1):
            indexed_posts.append({'index': index, 'post':post})
        context['posts'] = indexed_posts
        return render(request, "network/index.html", context)
            



def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
    
def like(request):
    body = json.loads(request.body.decode('utf-8'))
    post_id = body.get('post_id')
    post = Post.objects.get(pk = post_id)
    is_remove_like = body.get('is_remove_like')

    if is_remove_like:
        Like.objects.filter(user=request.user, post=post).delete()
        liked = False
    else:
        Like.objects.create(user=request.user, post=post)
        liked = True
    return JsonResponse({'liked':liked})

def follow(request):
    print('test python')
    body = json.loads(request.body.decode('utf-8'))
    user_id = body.get('user')
    user = User.objects.get(pk = user_id)

    
    if request.method == 'POST':
        Follower.objects.create(user = user, follower = request.user)
        followed = True
    elif request.method == 'DELETE':
        follow = Follower.objects.get(user = user, follower = request.user)
        follow.delete()
        followed = False
    return JsonResponse({'followed': followed})

def profile(request, user_id):
    user = User.objects.get(pk = user_id)
    context = {
        'user':user
    }
    if request.user.is_authenticated:
        is_following = Follower.objects.filter(user = user, follower = request.user).exists()
        context['is_following'] = is_following
    followers = Follower.objects.filter(user = user).all()
    user_posts = Post.objects.filter(user = user).all().order_by('timestamp').reverse()
    context['followers'] = followers
    #context['user_posts'] = user_posts
    indexed_posts = []
    #create indices for each post for page functionality
    for index, post in enumerate(user_posts, start=1):
        indexed_posts.append({'index': index, 'post':post})
    context['user_posts'] = indexed_posts
    return render(request, "network/profile.html", context)

def following(request):
    context = {}
    if request.user.is_authenticated:
        user_follows = Follower.objects.filter(follower = request.user).select_related('user').all()
        following_users = [follow.user for follow in user_follows]
        context['following_users'] = following_users
        posts = Post.objects.filter(user__in = following_users).all().order_by('-timestamp')
        indexed_posts = []
        #create indices for each post for page functionality
        for index, post in enumerate(posts, start=1):
            indexed_posts.append({'index': index, 'post':post})
        context['posts'] = indexed_posts

    return render(request, 'network/following.html', context)

