from flask import Flask, request, jsonify
from flask_cors import CORS

from pymongo import MongoClient
import random
import os
from dotenv import load_dotenv
import jwt
from functools import wraps
from bson import ObjectId
import json
from bson.json_util import dumps

load_dotenv()  # Load environment variables from .env file

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})  # Allow access from any origin

# MongoDB configuration
client = MongoClient(os.getenv("MONGO_URI"))
db = client.noterLite
blogs_collection = db.blogs
users_collection = db.users
user_views_collection = db.user_views

class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return super(JSONEncoder, self).default(obj)

app.json_encoder = JSONEncoder

def auth_middleware(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        refresh_token = request.cookies.get('refreshToken')
        
        if not auth_header and not refresh_token:
            return jsonify({"error": "Unauthorized access: no token or refreshToken"}), 401

        if not auth_header and refresh_token:
            try:
                decoded = jwt.decode(refresh_token, os.getenv("JWT_REFRESH_SECRET"), algorithms=["HS256"])
                request.user = decoded
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Invalid or expired refresh token"}), 401
        elif auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            try:
                decoded = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
                request.user = decoded
                request.token = token
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Invalid or expired token"}), 401

        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/blog/home', methods=['GET'])
def get_blogs():
    sort_type = request.args.get('sort', 'algorithm')
    limit = int(request.args.get('limit', 3))
    offset = int(request.args.get('offset', 0))

    if sort_type == 'recent':
        blogs = list(blogs_collection.find({"status": "published"}).sort("createdAt", -1).skip(offset).limit(limit))
    elif sort_type == 'popular':
        blogs = list(blogs_collection.find({"status": "published"}).sort([("likes", -1), ("views", -1)]).skip(offset).limit(limit))
    else:
        user_id = request.user['id'] if hasattr(request, 'user') else None
        blogs = get_blog_by_algorithm(user_id, limit)

    response = jsonify(json.loads(dumps(blogs)))
    return response

@app.route('/api/blog/createOrUpdate', methods=['POST'])
@auth_middleware
def create_or_update_blog():
    data = request.json
    blog_id = data.get('blogId')
    title = data.get('title')
    content = data.get('content')
    temp_images = data.get('tempImages')
    status = data.get('status')
    user_id = request.user['_id']

    if not isinstance(temp_images, list) or not all(img.startswith("http") or img.startswith("https") for img in temp_images):
        return jsonify({"error": "Invalid image URLs"}), 400

    image_url_map = {img.split("/")[-1]: img for img in temp_images}
    updated_content = content
    for alt_text, img_url in image_url_map.items():
        updated_content = updated_content.replace(f"![{alt_text}]({img_url})", f"![{alt_text}]({img_url})")

    if blog_id:
        blog = blogs_collection.find_one_and_update(
            {"_id": blog_id, "author": user_id},
            {"$set": {"title": title, "content": updated_content, "images": temp_images, "status": status}},
            return_document=True
        )
    else:
        blog = blogs_collection.insert_one({
            "title": title,
            "content": updated_content,
            "images": temp_images,
            "author": user_id,
            "status": status
        })

    return jsonify({"message": "Blog saved successfully", "blog": json.loads(dumps(blog))})

@app.route('/api/blog/all', methods=['GET'])
@auth_middleware
def get_user_blogs():
    user_id = request.user['_id']
    blogs = list(blogs_collection.find({"author": user_id}).sort("lastUpdated", -1))
    return jsonify(json.loads(dumps(blogs)))

@app.route('/api/blog/delete', methods=['POST'])
@auth_middleware
def delete_blog():
    blog_id = request.json.get('blogId')
    user_id = request.user['_id']
    result = blogs_collection.delete_one({"_id": blog_id, "author": user_id})
    if result.deleted_count == 0:
        return jsonify({"error": "Blog not found"}), 404
    return jsonify({"message": "Blog deleted successfully"})

@app.route('/api/blog/moveToDraft', methods=['POST'])
@auth_middleware
def move_blog_to_draft():
    blog_id = request.json.get('blogId')
    blog = blogs_collection.find_one({"_id": blog_id})
    if not blog:
        return jsonify({"error": "Blog not found"}), 404
    blogs_collection.update_one({"_id": blog_id}, {"$set": {"status": "draft"}})
    return jsonify({"message": "Blog moved to draft"})

@app.route('/api/blog/republishBlog', methods=['POST'])
@auth_middleware
def republish_blog():
    blog_id = request.json.get('blogId')
    blog = blogs_collection.find_one({"_id": blog_id})
    if not blog:
        return jsonify({"error": "Blog not found"}), 404
    blogs_collection.update_one({"_id": blog_id}, {"$set": {"status": "published"}})
    return jsonify({"message": "Blog republished"})

@app.route('/api/blog/getBlogById', methods=['POST'])
@auth_middleware
def get_blog_by_id():
    blog_id = request.json.get('blogId')
    blog = blogs_collection.find_one({"_id": blog_id})
    if not blog:
        return jsonify({"error": "Blog not found"}), 404
    return jsonify(json.loads(dumps(blog)))

@app.route('/api/blog/storeViewedBlog', methods=['POST'])
@auth_middleware
def store_viewed_blog():
    data = request.json
    blog_id = data.get('blogId')
    user_id = request.user['id'] or None;

    if not blog_id:
        return jsonify({"error": "Blog ID is required"}), 400

    user_view = user_views_collection.find_one({"user_id": user_id})
    if user_view:
        user_views_collection.update_one(
            {"user_id": user_id},
            {"$addToSet": {"viewed_blogs": ObjectId(blog_id)}}
        )
    else:
        user_views_collection.insert_one({
            "user_id": user_id,
            "viewed_blogs": [ObjectId(blog_id)]
        })

    return jsonify({"message": "Viewed blog stored successfully"})

def get_blog_by_algorithm(user_id, limit=1):
    if not user_id:
        return list(blogs_collection.find({"status": "published"}).limit(limit))

    viewed_blogs = user_views_collection.find_one({"user_id": user_id}, {"viewed_blogs": 1})
    viewed_blog_ids = viewed_blogs["viewed_blogs"] if viewed_blogs else []

    blogs = list(blogs_collection.find({"_id": {"$nin": viewed_blog_ids}, "status": "published"}))

    if not blogs:
        blogs = list(blogs_collection.find({"status": "published"}))

    selected_blogs = random.sample(blogs, min(limit, len(blogs)))
    return selected_blogs

if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv("PORT", 4002)))
