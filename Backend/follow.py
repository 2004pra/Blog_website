from flask import Blueprint, jsonify
from db import db
from auth import token_required
from bson import ObjectId

follow_bp = Blueprint("follow", __name__)

@follow_bp.route("/follow/<target_user_id>",methods=["POST"])
@token_required
def follow(user_id,target_user_id):
    if user_id == target_user_id:
        return jsonify({"error":"cannot follow yourself"}), 400

    if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(target_user_id):
        return jsonify({"error": "invalid user id"}), 400

    user = db.users.find_one({"_id":ObjectId(user_id)})
    target_user = db.users.find_one({"_id":ObjectId(target_user_id)})
    if not user or not target_user:
        return jsonify({"error": "user not found"}), 404

    existing_follow = db.followers.find_one({
        "follower_id": user_id,
        "following_id": target_user_id
    })

    if existing_follow:
        db.followers.delete_one({"_id": existing_follow["_id"]})
        return jsonify({"message": "unfollowed successfully", "isFollowing": False}), 200

    follower = user.get("username")
    following = target_user.get("username")

    db.followers.insert_one({
    "follower_id":user_id,
    "following_id":target_user_id,
    "follower":follower,
    "following":following
    })

    return jsonify({"message":"followed successfully", "isFollowing": True}), 200




@follow_bp.route("/follow/view/<target_user_id>", methods=["GET"])
@token_required
def follow_data(user_id, target_user_id):
    if not ObjectId.is_valid(target_user_id):
        return jsonify({"error": "invalid user id"}), 400

    target_user = db.users.find_one({"_id": ObjectId(target_user_id)})
    if not target_user:
        return jsonify({"error": "user not found"}), 404

    follower_docs = list(db.followers.find({"following_id": target_user_id}))
    following_docs = list(db.followers.find({"follower_id": target_user_id}))

    followers = [
        {
            "user_id": doc.get("follower_id"),
            "username": doc.get("follower", "Unknown")
        }
        for doc in follower_docs
    ]

    following = [
        {
            "user_id": doc.get("following_id"),
            "username": doc.get("following", "Unknown")
        }
        for doc in following_docs
    ]

    return jsonify({
        "profile_user_id": target_user_id,
        "followers": followers,
        "following": following,
        "followers_count": len(followers),
        "following_count": len(following)
    }), 200
    
    


    