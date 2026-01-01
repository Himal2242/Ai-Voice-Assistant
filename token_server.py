import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from livekit.api import AccessToken

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

@app.route("/token")
def get_token():
    # ✅ create token with ONLY api_key & api_secret
    token = AccessToken(
        api_key=LIVEKIT_API_KEY,
        api_secret=LIVEKIT_API_SECRET,
    )

    # ✅ set identity AFTER creation
    token.identity = "frontend-user"

    # ✅ set grants AFTER creation (THIS IS THE KEY PART)
    token.grants = {
        "roomJoin": True,
        "room": "demo",
        "canPublish": True,
        "canSubscribe": True,
    }

    return jsonify({
        "token": token.to_jwt()
    })

if __name__ == "__main__":
    app.run(port=3001)











# import os
# from flask import Flask, jsonify
# from flask_cors import CORS
# from dotenv import load_dotenv
# from livekit import api

# load_dotenv()

# app = Flask(__name__)

# # ✅ ENABLE CORS (THIS FIXES YOUR ERROR)
# CORS(app, origins=["http://localhost:5173"])

# LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
# LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

# @app.route("/token")
# def get_token():
#     token = api.AccessToken(
#         api_key=LIVEKIT_API_KEY,
#         api_secret=LIVEKIT_API_SECRET,
#     )

#     token.identity = "frontend-user"

#     token.room = "demo"
#     token.can_publish = True
#     token.can_subscribe = True

#     return jsonify({
#         "token": token.to_jwt()
#     })

# if __name__ == "__main__":
#     app.run(port=3001)
