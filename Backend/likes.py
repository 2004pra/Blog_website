from flask import Blueprint, request, jsonify
from datetime import datetime
from db import db
from auth import token_required
from bson import ObjectId
from bson.errors import InvalidId



likes_bp = Blueprint("likes", __name__)

@likes_bp.route("/likes/<video_id>", methods=["POST"])
@token_required
def addlike(user_id, video_id):
    try:
        object_id = ObjectId(video_id)
    except InvalidId:
        return jsonify({"error": "Invalid video id"}), 400

    video = db.videos.find_one({"_id": object_id})
    if not video:
        return jsonify({"error": "No video found"}), 404

    existing = db.likes.find_one({
        "video_id": video_id,
        "user_id": user_id
    })

    if existing:
        db.likes.delete_one({
            "video_id": video_id,
            "user_id": user_id
        })
        liked = False
        message = "unliked"
    else:
        db.likes.insert_one({
            "user_id": user_id,
            "video_id": video_id,
            "created_at": datetime.utcnow()
        })
        liked = True
        message = "video liked"

    count = db.likes.count_documents({"video_id": video_id})
    return jsonify({"message": message, "liked": liked, "likes": count}), 200
    
    
    
    
    
#likes count 

@likes_bp.route("/like_count/<video_id>", methods=["GET"])
def like_count(video_id):
    count = db.likes.count_documents({"video_id": video_id})
    return jsonify({"likes": count}), 200



#like status if user liked or not
@likes_bp.route("/status/<video_id>", methods=["GET"])
@token_required
def like_status(user_id, video_id):
    liked = db.likes.find_one({
        "user_id": user_id,
        "video_id": video_id
    }) is not None

    return jsonify({"liked": liked}), 200
    