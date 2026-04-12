from flask import Blueprint,request, jsonify
from db import db

from auth import token_required

from bson import ObjectId



profile_bp = Blueprint("profile", __name__)


#this is for profile picture
@profile_bp.route("/profilepic",methods=["POST"])
@token_required
def profile_pic(user_id):
    data = request.get_json() or {}
    profile_pic_url = data.get("profile_pic_url")

    if not profile_pic_url:
        return jsonify({"error":"No profile photo uploaded"}), 400

    db.profiles.update_one(
        {"user_id": user_id},
        {"$set": {"profile_pic_url": profile_pic_url, "user_id": user_id}},
        upsert=True
    )

    return jsonify({"message":"profile pic updated successfully!", "profile_pic_url": profile_pic_url}), 200
    
    

    
        
    
    

@profile_bp.route("/profile",methods=["GET"])
@token_required
def get_info(user_id):
    user = db.users.find_one({"_id": ObjectId(user_id)})
    posts = list(db.posts.find({"user_id":user_id}))
    videos = list(db.videos.find({"user_id":user_id}))
    profile_doc = db.profiles.find_one({"user_id": user_id})
    profile_pic_url = profile_doc.get("profile_pic_url") if profile_doc else None
    result1=[]
    result2=[]
    
    for post in posts:
         result1.append({
             "id": str(post["_id"]),
            "title": post["title"],
            "content": post["content"],
              "user_id": post.get("user_id"),
              "username": user["username"],
              "created_at": str(post.get("created_at"))
         })
         
    for video in videos:
         result2.append({
             "id": str(video["_id"]),
            "title": video["title"],
            "description": video["description"],
            "video_url":video["video_url"],
              "user_id": video.get("user_id"),
              "username": user["username"],
              "created_at": str(video.get("created_at"))
         })
        
    
    
    return jsonify({
        "user": {
            "id": str(user["_id"]),
            "username": user["username"],
            "profile_pic_url": profile_pic_url
        },
        "posts": result1,
        "videos":result2
    })    

