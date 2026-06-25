from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import BloodRequest, Donation, User, BloodInventory
from datetime import datetime

bp = Blueprint('hospital', __name__, url_prefix='/api/hospital')

@bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user or user.role != 'hospital':
        return jsonify({"msg": "Unauthorized"}), 403
        
    recent_requests = BloodRequest.objects(hospital=user).order_by('-created_at').limit(5)
    recent_donations = Donation.objects(
        blood_request__in=BloodRequest.objects(hospital=user),
        status='COMPLETED'
    ).order_by('-donation_date').limit(5)
    
    requests_data = [{
        "id": str(r.id),
        "blood_type": r.blood_type,
        "units_needed": r.units_needed,
        "priority": r.priority,
        "status": r.status,
        "created_at": r.created_at.isoformat()
    } for r in recent_requests]
    
    donations_data = [{
        "id": str(d.id),
        "blood_type": d.blood_type,
        "units": d.units,
        "donation_date": d.donation_date.isoformat()
    } for d in recent_donations]
    
    return jsonify({
        "recent_requests": requests_data,
        "recent_donations": donations_data
    }), 200

@bp.route('/blood-requests', methods=['GET'])
@jwt_required()
def blood_requests():
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user or user.role != 'hospital':
        return jsonify({"msg": "Unauthorized"}), 403
        
    page = request.args.get('page', 1, type=int)
    requests = BloodRequest.objects(hospital=user).order_by('-created_at').paginate(page=page, per_page=10)
    
    return jsonify({
        "requests": [{
            "id": str(r.id),
            "blood_type": r.blood_type,
            "units_needed": r.units_needed,
            "priority": r.priority,
            "status": r.status,
            "created_at": r.created_at.isoformat()
        } for r in requests.items],
        "total_pages": requests.pages
    }), 200

@bp.route('/create-request', methods=['POST'])
@jwt_required()
def create_request():
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user or user.role != 'hospital':
        return jsonify({"msg": "Unauthorized"}), 403
        
    data = request.get_json()
    blood_type = data.get('blood_type')
    units_needed = int(data.get('units_needed'))
    
    inventory_items = BloodInventory.objects(blood_type=blood_type)
    total_available = sum([item.units_available for item in inventory_items])
    
    if total_available < units_needed:
        return jsonify({"msg": f"Requested blood group {blood_type} not available"}), 400
        
    try:
        deadline = datetime.strptime(data.get('deadline'), '%Y-%m-%dT%H:%M:%S.%fZ')
    except ValueError:
        try:
            deadline = datetime.strptime(data.get('deadline'), '%Y-%m-%dT%H:%M')
        except ValueError:
            deadline = datetime.strptime(data.get('deadline'), '%Y-%m-%d')

    new_request = BloodRequest(
        hospital=user,
        blood_type=blood_type,
        units_needed=units_needed,
        priority=data.get('priority'),
        patient_details=data.get('patient_details'),
        deadline=deadline,
        status='PENDING'
    )
    new_request.save()
    
    return jsonify({"msg": "Request created successfully"}), 201

@bp.route('/create-emergency-request', methods=['POST'])
@jwt_required()
def create_emergency_request():
    from app.models import Notification
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user or user.role != 'hospital':
        return jsonify({"msg": "Unauthorized"}), 403
        
    data = request.get_json()
    blood_type = data.get('blood_type')
    units_needed = int(data.get('units_needed'))
    
    try:
        deadline = datetime.strptime(data.get('deadline'), '%Y-%m-%dT%H:%M:%S.%fZ')
    except ValueError:
        try:
            deadline = datetime.strptime(data.get('deadline'), '%Y-%m-%dT%H:%M')
        except ValueError:
            deadline = datetime.strptime(data.get('deadline'), '%Y-%m-%d')

    # Save as CRITICAL BloodRequest regardless of inventory
    new_request = BloodRequest(
        hospital=user,
        blood_type=blood_type,
        units_needed=units_needed,
        priority='CRITICAL',
        patient_details=data.get('patient_details', 'Emergency Response'),
        deadline=deadline,
        status='PENDING'
    )
    new_request.save()
    
    # Alert all donors with this blood type
    matched_donors = User.objects(role='donor', blood_type=blood_type)
    count = 0
    for donor in matched_donors:
        notification = Notification(
            user=donor,
            message=f"URGENT: {user.first_name} Hospital needs {units_needed} units of {blood_type} blood immediately!",
            related_request=new_request
        )
        notification.save()
        count += 1
        
    return jsonify({
        "msg": f"Emergency Request created successfully. Alerted {count} matched donors.",
        "donors_notified": count
    }), 201