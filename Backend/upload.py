from flask import Blueprint, jsonify
import cloudinary
import cloudinary.utils
import os
import time
from auth import token_required
from db import db
from bson import ObjectId

upload_bp = Blueprint("upload", __name__)

@upload_bp.route("/get-signature", methods=["GET"])
@token_required
def get_signature(current_user_id):
    timestamp = int(time.time())

    user = db.users.find_one({"_id": ObjectId(current_user_id)})
    username = user.get("username") if user else None

    signature = cloudinary.utils.api_sign_request(
        {"timestamp": timestamp},
        os.getenv("CLOUDINARY_API_SECRET")
    )

    return jsonify({
        "timestamp": timestamp,
        "signature": signature,
        "api_key": os.getenv("CLOUDINARY_API_KEY"),
        "cloud_name": os.getenv("CLOUDINARY_CLOUD_NAME"),
        "user_id": current_user_id,
        "username": username
    })