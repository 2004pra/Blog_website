from flask import Blueprint, request, jsonify
from datetime import datetime
from db import db

from auth import token_required

from bson import ObjectId



profile_bp = Blueprint("profile", __name__)

@profile_bp.route("/profile",methods=["GET"])
@token_required
def get_info(user_id):
    user = db.users.find_one({"_id": ObjectId(user_id)})
    posts = list(db.posts.find({"user_id":user_id}))
    
    result=[]
    
    for post in posts:
         result.append({
             "id": str(post["_id"]),
            "title": post["title"],
            "content": post["content"],
         })
        
    
    
    return jsonify({
        "user": {
            "id": str(user["_id"]),
            "username": user["username"]
        },
        "posts": result
    })    

