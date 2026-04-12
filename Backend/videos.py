from flask import Blueprint, request, jsonify
from datetime import datetime
from db import db
from auth import token_required
from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument

videos_bp = Blueprint("videos", __name__)

@videos_bp.route("/Upload_video",methods=["POST"])
@token_required
def createVideo(user_id):
    data = request.get_json()
    title = data.get("title")
    likes = 0
    description = data.get("description")
    video_url = data.get("video_url")
    if not video_url:
        return jsonify({"error":"No video uploaded from user"}),400
    if not title or not description:
        return jsonify({"error":"Missing feilds"}),400
    
    video = {
        "title" : title,
        "description":description,
        "video_url":video_url,
         "user_id"    : user_id,
        "created_at" : datetime.utcnow(),
        "likes":likes
    }
    
    db.videos.insert_one(video)
    
    return jsonify({"message": "Video created successfully"});





#sending video data to frontend


@videos_bp.route("/",methods=["GET"])
def get_video():
    videos = list(db.videos.find().sort("created_at",-1))

    user_ids = {video.get("user_id") for video in videos if video.get("user_id")}
    username_map = {}
    profile_pic_map = {}

    for uid in user_ids:
        try:
            user = db.users.find_one({"_id": ObjectId(uid)})
            username_map[uid] = user.get("username") if user else "Unknown"
        except Exception:
            username_map[uid] = "Unknown"

    if user_ids:
        profile_docs = list(db.profiles.find({"user_id": {"$in": list(user_ids)}}))
        for profile in profile_docs:
            profile_user_id = profile.get("user_id")
            if profile_user_id:
                profile_pic_map[profile_user_id] = profile.get("profile_pic_url")
    
    result = []
    
    for video in videos:
        video_user_id = video.get("user_id")
        result.append({
            "id":str(video["_id"]),
            "title":video["title"],
            "description":video["description"],
            "video_url":video["video_url"],
            "user_id":video_user_id,
            "username":username_map.get(video_user_id, "Unknown"),
            "profile_pic_url":profile_pic_map.get(video_user_id),
            "created_at":str(video.get("created_at")),
            "likes":int(video.get("likes", 0))
        })
        
    return jsonify(result)


@videos_bp.route("/delete/<video_id>",methods=["DELETE"])
@token_required
def delete_video(user_id,video_id):
    video = db.videos.find_one({"_id": ObjectId(video_id)})
 
    if not video:
        return jsonify({"error":"No video found"}),404
    
    #checking ownership
    if video["user_id"] != user_id:
        return jsonify({"error":"Unauthorized"}),403

    
    db.videos.delete_one({"_id":ObjectId(video_id)})
    
    return jsonify({"message":"video deleted successfully ✅"})




