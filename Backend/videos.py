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
        "likes":likes,
        "views":0
    }
    
    db.videos.insert_one(video)
    
    return jsonify({"message": "Video created successfully"});





#sending video data to frontend


@videos_bp.route("/",methods=["GET"])
def get_video():
    videos = list(db.videos.find().sort("created_at",-1))
    comments = list(db.comments.find().sort("created_at",-1))
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
            "likes":int(video.get("likes", 0)),
            "views":int(video.get("views",0))
            
        })
        
    return jsonify(result)


#comments
@videos_bp.route("/comment/<video_id>",methods=["POST"])
@token_required
def comment(user_id,video_id):
    data = request.get_json()
    comment = data.get("comment")
    video_url = db.videos.find_one({"_id":ObjectId(video_id)})
    if not video_url:
        return jsonify({"error":"No video found"}),404
    
    if not comment:
        return jsonify({"error":"comment is empty"}),400
    
    db.comments.insert_one({
        "comment":comment,
        "user_id":user_id,
        "video_id":video_id,
        "created_at": datetime.utcnow()
    })
    
    return jsonify({"message":"comment done successfully!"})
    
    
   
   
#comment data send to frontend

@videos_bp.route("/comment/<video_id>",methods=["GET"])
@token_required
def comment_send(user_id, video_id):
    try:
        object_id = ObjectId(video_id)
    except InvalidId:
        return jsonify({"error": "Invalid video id"}), 400

    video = db.videos.find_one({"_id": object_id})
    if not video:
        return jsonify({"error": "No video found"}), 404

    comments = list(db.comments.find({"video_id": video_id}).sort("created_at", -1))
    if not comments:
        return jsonify([]), 200

    comment_user_ids = {comment.get("user_id") for comment in comments if comment.get("user_id")}
    username_map = {}

    for uid in comment_user_ids:
        try:
            user = db.users.find_one({"_id": ObjectId(uid)})
            username_map[uid] = user.get("username") if user else "Unknown"
        except Exception:
            username_map[uid] = "Unknown"

    all_comments = []
    for comment in comments:
        comment_user_id = comment.get("user_id")
        all_comments.append({
            "id": str(comment.get("_id")),
            "comment": comment.get("comment", ""),
            "user_id": comment_user_id,
            "username": username_map.get(comment_user_id, "Unknown"),
            "video_id": comment.get("video_id"),
            "created_at": str(comment.get("created_at"))
        })

    return jsonify(all_comments), 200
    
    
    
#video delete route    

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






#video views count new route

@videos_bp.route("/videos/views/<video_id>",methods=["POST"])
@token_required
def views(user_id,video_id):
    video = db.videos.find_one({"_id":ObjectId(video_id)})
    if not video:
        return jsonify({"error":"video not found"}),404
    
    db.videos.update_one(
        {"_id":ObjectId(video_id)},
        {"$inc":{"views":1}}
    )
    return jsonify({"message":"count updated successfully"})



