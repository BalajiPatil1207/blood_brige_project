from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User, Hospital, BloodBank

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.objects(email=email).first()
    
    if user is None or not user.check_password(password):
        return jsonify({"msg": "Invalid email or password"}), 401
    
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "token": access_token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "role": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    }), 200

@bp.route('/register/<user_type>', methods=['POST'])
def register(user_type):
    if user_type not in ['donor', 'hospital', 'blood_bank']:
        return jsonify({"msg": "Invalid user type"}), 400
    
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    phone = data.get('phone')
    address = data.get('address')
    
    if User.objects(email=email).first():
        return jsonify({"msg": "Email already registered"}), 409
    
    if user_type == 'donor':
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            address=address,
            role='donor',
            blood_type=data.get('blood_type')
        )
    elif user_type == 'hospital':
        user = Hospital(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            address=address,
            role='hospital',
            name=data.get('hospital_name')
        )
    else:  # blood_bank
        user = BloodBank(
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            address=address,
            role='blood_bank',
            name=data.get('bank_name')
        )
    
    user.set_password(password)
    user.save()
    
    return jsonify({"msg": "Registration successful"}), 201

@bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    user = User.objects(id=current_user_id).first()
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    user_data = {
        "id": str(user.id),
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "address": user.address
    }
    
    if user.role == 'donor':
        user_data['blood_type'] = user.blood_type
    elif user.role == 'hospital':
        user_data['name'] = user.name
    elif user.role == 'blood_bank':
        user_data['name'] = user.name
        
    return jsonify(user_data), 200
