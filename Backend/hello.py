import jwt
import datetime
import os
from dotenv import load_dotenv
from posts import posts_bp
from videos import videos_bp
from upload import upload_bp
from likes import likes_bp
load_dotenv()
from flask import Flask,jsonify
from flask import request
from markupsafe import escape
from flask import request
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from db import db
from profile import profile_bp






SECRET_KEY = os.getenv("SECRET_KEY")
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
bcrypt = Bcrypt(app)
app.register_blueprint(posts_bp,url_prefix="/posts")
app.register_blueprint(profile_bp)
app.register_blueprint(videos_bp,url_prefix="/api/videos")
app.register_blueprint(upload_bp)
app.register_blueprint(likes_bp,url_prefix="/likes")



#signup part created by Prashant

@app.route("/signup",methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get("username").lower()
    password = data.get("password")
    
    if not username and not password:
        return jsonify({"error":"Please provide username and password"}),400
    
    existing_user = db.users.find_one({"username":username})
    if existing_user:
        return jsonify({"error":"User already exits!"}),400
    
    hashed =  bcrypt.generate_password_hash(password).decode("utf-8")
    
    user  = {
         "username" : username,
         "password" : hashed
    }
    
    db.users.insert_one(user);
    
    return jsonify({"message": "User created successfully"}), 201
    
 
 
 
 
 #login part created by Prashant 
 

@app.route("/login",methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    
    username = username.strip().lower()
    
    existing_user = db.users.find_one({"username":username})
    if existing_user:
        hashed = bcrypt.generate_password_hash(password).decode("utf-8")
        if bcrypt.check_password_hash(existing_user["password"], password):
            token = jwt.encode({
               "user_id": str(existing_user["_id"]),
               "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            }, SECRET_KEY, algorithm="HS256")
            return jsonify({
                 "status": "success",
                 "token": token,
                 "user": {
                         "id": str(existing_user["_id"]),
                         "username": existing_user["username"]
                         }
            })
            
        else:
            return jsonify({"message":"Inavlid Credentials!"}),403
    else:
        return jsonify({"message":"Inavlid Credentials!"}),403
    
    


#
handler = app
    

@app.route('/')
def index():
    user = "Everyone"
    return f"Hello,{user}!"


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_ENV") != "production")

# here adding route for load testing text file 

from flask import send_file

@app.route('/loaderio-2483443819ae1f94373f67a615c11501.txt')
def loaderio_verify():
    return send_file('loaderio-2483443819ae1f94373f67a615c11501.txt')