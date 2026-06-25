from flask import Flask
from flask_mongoengine import MongoEngine
from config import Config
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from datetime import timedelta

socketio = SocketIO(cors_allowed_origins="*")

db = MongoEngine()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for all routes (React frontend will be on a different port)
    CORS(app, supports_credentials=True)
    
    # Configure JWT
    app.config["JWT_SECRET_KEY"] = app.config.get('SECRET_KEY', 'super-secret')
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

    db.init_app(app)
    jwt.init_app(app)

    # IMPORTANT
    socketio.init_app(app)

    # Blueprints import
    from app.routes import main, auth, donor, hospital, blood_bank, admin

    # Blueprints register
    app.register_blueprint(main.bp)
    app.register_blueprint(auth.bp)
    app.register_blueprint(donor.bp)
    app.register_blueprint(hospital.bp)
    app.register_blueprint(blood_bank.bp)
    app.register_blueprint(admin.bp)

    return app