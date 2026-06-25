from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Donation, User, BloodDrive, DriveRegistration
from datetime import datetime

bp = Blueprint('donor', __name__, url_prefix='/api/donor')

@bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user or user.role != 'donor':
        return jsonify({"msg": "Unauthorized"}), 403
        
    donations = Donation.objects(donor=user).order_by('-donation_date')
    
    registered_drives = DriveRegistration.objects(
        donor=user,
        status='REGISTERED'
    ).order_by('-registration_date')
    
    donations_data = [{
        "id": str(d.id),
        "blood_type": d.blood_type,
        "units": d.units,
        "donation_date": d.donation_date.isoformat(),
        "status": d.status
    } for d in donations]
    
    drives_data = [{
        "id": str(r.id),
        "drive_id": str(r.blood_drive.id),
        "title": r.blood_drive.title,
        "date": r.blood_drive.start_date.isoformat(),
        "location": r.blood_drive.location
    } for r in registered_drives]
    
    return jsonify({
        "donations": donations_data,
        "registered_drives": drives_data
    }), 200

@bp.route('/schedule-donation', methods=['POST'])
@jwt_required()
def schedule_donation():
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user or user.role != 'donor':
        return jsonify({"msg": "Unauthorized"}), 403
        
    data = request.get_json()
    try:
        donation_date = datetime.strptime(data.get('donation_date'), '%Y-%m-%d')
    except ValueError:
        donation_date = datetime.utcnow()
        
    last_donation = Donation.objects(
        donor=user,
        status='COMPLETED'
    ).order_by('-donation_date').first()
    
    if last_donation and (donation_date - last_donation.donation_date).days < 56:
        return jsonify({"msg": "You must wait 56 days between donations"}), 400
        
    donation = Donation(
        donor=user,
        blood_type=user.blood_type,
        donation_date=donation_date,
        status='PENDING'
    )
    donation.save()
    
    return jsonify({"msg": "Donation scheduled successfully"}), 201

@bp.route('/register-drive/<drive_id>', methods=['POST'])
@jwt_required()
def register_for_drive(drive_id):
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user or user.role != 'donor':
        return jsonify({"msg": "Unauthorized"}), 403
        
    drive = BloodDrive.objects(id=drive_id).first()
    if not drive:
        return jsonify({"msg": "Drive not found"}), 404
        
    existing = DriveRegistration.objects(donor=user, blood_drive=drive).first()
    if existing:
        return jsonify({"msg": "Already registered"}), 400
        
    registration = DriveRegistration(
        donor=user,
        blood_drive=drive,
        notes=request.get_json().get('notes', '')
    )
    registration.save()
    
    return jsonify({"msg": "Successfully registered"}), 201

@bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    from app.models import Notification
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user or user.role != 'donor':
        return jsonify({"msg": "Unauthorized"}), 403
        
    notifications = Notification.objects(user=user, is_read=False).order_by('-created_at')
    
    data = [{
        "id": str(n.id),
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat(),
        "request_id": str(n.related_request.id) if n.related_request else None
    } for n in notifications]
    
    return jsonify({"notifications": data}), 200

@bp.route('/notifications/<notif_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notif_id):
    from app.models import Notification
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user or user.role != 'donor':
        return jsonify({"msg": "Unauthorized"}), 403
        
    notification = Notification.objects(id=notif_id, user=user).first()
    if not notification:
        return jsonify({"msg": "Notification not found"}), 404
        
    notification.is_read = True
    notification.save()
    
    return jsonify({"msg": "Notification marked as read"}), 200