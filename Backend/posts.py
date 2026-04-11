from flask import Blueprint, request, jsonify
from datetime import datetime
from db import db
from auth import token_required
from bson import ObjectId

posts_bp = Blueprint("posts", __name__)

@posts_bp.route("/create_post", methods=["POST"])
@token_required
def create_posts(user_id):
    data = request.get_json()
    
    title = data.get("title")
    content = data.get("content")
    
    
    if not title or not content:
        return jsonify({"error": "Missing fields"}),400
    
    post = {
        "title"      : title,
        "content"    : content,
        "user_id"    : user_id,
        "created_at" : datetime.utcnow()
    }
    
    db.posts.insert_one(post)
    
    return jsonify({"message":"Post created ✌️"})



# handling get request from frontend

@posts_bp.route("/",methods=["GET"])
def get_posts():
    posts = list(db.posts.find().sort("created_at",-1))

    user_ids = {post.get("user_id") for post in posts if post.get("user_id")}
    username_map = {}

    for uid in user_ids:
        try:
            user = db.users.find_one({"_id": ObjectId(uid)})
            username_map[uid] = user.get("username") if user else "Unknown"
        except Exception:
            username_map[uid] = "Unknown"

    result=[]
    for post in posts:
        post_user_id = post.get("user_id")
        result.append({
            "id":str(post["_id"]),
            "title":post["title"],
            "content":post["content"],
            "user_id":post_user_id,
            "created_at":str(post.get("created_at")),
            "username" : username_map.get(post_user_id, "Unknown")
        })
        
    
    return jsonify(result)    





# for deleting post

@posts_bp.route("/delete/<post_id>", methods=["DELETE"])
@token_required
def delete_post(user_id, post_id):
    post = db.posts.find_one({"_id": ObjectId(post_id)})

    if not post:
        return jsonify({"error": "Post not found"}), 404

    # check ownership
    if post["user_id"] != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.posts.delete_one({"_id": ObjectId(post_id)})

    return jsonify({"message": "Post deleted successfully"})






#update post


@posts_bp.route("/update/<post_id>", methods=["PUT"])
@token_required
def update_post(user_id, post_id):
    data = request.get_json()

    title = data.get("title")
    content = data.get("content")

    post = db.posts.find_one({"_id": ObjectId(post_id)})

    if not post:
        return jsonify({"error": "Post not found"}), 404

    # check ownership
    if post["user_id"] != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {
            "$set": {
                "title": title,
                "content": content
            }
        }
    )

    return jsonify({"message": "Post updated successfully"})


