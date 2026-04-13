from flask import Blueprint, request, jsonify
from datetime import datetime
from db import db
from auth import token_required
from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument

user_profile_bp = Blueprint("user_profile", __name__)

@user_profile_bp.route("/users/<user_id>/profile",methods=["GET"])
@token_required
def profile_view(current_user_id,user_id):
    if not ObjectId.is_valid(user_id):
        return jsonify({"error": "Invalid user id"}), 400
    target_user = db.users.find_one({"_id":ObjectId(user_id)})
    target_profile = db.profiles.find_one({"user_id":user_id})
    target_posts = list(db.posts.find({"user_id": user_id}).sort("created_at", -1))
    target_videos = list(db.videos.find({"user_id": user_id}).sort("created_at", -1))
    is_following = db.followers.find_one({
        "follower_id": current_user_id,
        "following_id": user_id
    }) is not None
    if not target_user:
        return jsonify({"error":"User Not found"}),404
    if not target_posts:
        target_posts = []
    if not target_videos:
        target_videos = []
        
    username = target_user.get("username","Unknown")
    target_user_profile_pic = (target_profile or {}).get("profile_pic_url")
    posts_values = [
    {
        "title": post.get("title"),
        "content": post.get("content"),
        "created_at": str(post.get("created_at"))
    }
    for post in target_posts
    ]
    videos_values = [
    {
        "title": video.get("title"),
        "description": video.get("description"),
        "video_url": video.get("video_url"),
        "created_at": str(video.get("created_at")),
        "likes": int(video.get("likes", 0)),
        "views": int(video.get("views", 0))
    }
    for video in target_videos
    ]
    
    return jsonify ({
        "profile_user_id": user_id,
        "profile_username":username,
        "profile_pic":target_user_profile_pic,
        "is_following": is_following,
        "profile_post":posts_values,
        "profile_videos":videos_values
    })
