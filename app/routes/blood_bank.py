from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import BloodInventory, Donation, BloodDrive, User
from datetime import datetime, timedelta

bp = Blueprint('blood_bank', __name__, url_prefix='/api/blood-bank')

@bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user or user.role not in ['blood_bank', 'admin']:
        return jsonify({"msg": "Unauthorized"}), 403
        
    inventory = BloodInventory.objects(blood_bank=user)
    low_stock = [item for item in inventory if item.units_available < 10]
    
    recent_donations = Donation.objects(
        status='COMPLETED',
        donation_date__gt=datetime.utcnow() - timedelta(days=7)
    ).order_by('-donation_date').limit(5)
    
    total_drives = BloodDrive.objects(blood_bank=user).count()
    upcoming_drives = BloodDrive.objects(blood_bank=user, start_date__gt=datetime.utcnow()).count()
    
    recent_drives = BloodDrive.objects(blood_bank=user).order_by('-start_date').limit(5)
    
    inventory_data = [{
        "blood_type": i.blood_type,
        "units": i.units_available
    } for i in inventory]
    
    return jsonify({
        "inventory": inventory_data,
        "low_stock_count": len(low_stock),
        "total_drives": total_drives,
        "upcoming_drives": upcoming_drives,
        "recent_donations": [{
            "id": str(d.id),
            "blood_type": d.blood_type,
            "units": d.units,
            "date": d.donation_date.isoformat()
        } for d in recent_donations],
        "recent_drives": [{
            "id": str(d.id),
            "title": d.title,
            "date": d.start_date.isoformat(),
            "status": d.status
        } for d in recent_drives]
    }), 200

@bp.route('/update-inventory', methods=['POST'])
@jwt_required()
def update_inventory():
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user or user.role != 'blood_bank':
        return jsonify({"msg": "Unauthorized"}), 403
        
    data = request.get_json()
    blood_type = data.get('blood_type')
    units = int(data.get('units', 0))
    
    inventory_item = BloodInventory.objects(blood_bank=user, blood_type=blood_type).first()
    if inventory_item:
        inventory_item.units_available = units
    else:
        inventory_item = BloodInventory(
            blood_bank=user,
            blood_type=blood_type,
            units_available=units
        )
    inventory_item.save()
    
    return jsonify({"msg": "Inventory updated successfully"}), 200

@bp.route('/schedule-drive', methods=['POST'])
@jwt_required()
def schedule_drive():
    user_id = get_jwt_identity()
    user = User.objects(id=user_id).first()
    
    if not user or user.role not in ['blood_bank', 'admin']:
        return jsonify({"msg": "Unauthorized"}), 403
        
    data = request.get_json()
    
    try:
        start_date = datetime.strptime(data.get('start_date'), '%Y-%m-%dT%H:%M:%S.%fZ')
        end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%dT%H:%M:%S.%fZ')
    except ValueError:
        start_date = datetime.strptime(data.get('start_date'), '%Y-%m-%dT%H:%M')
        end_date = datetime.strptime(data.get('end_date'), '%Y-%m-%dT%H:%M')
        
    drive = BloodDrive(
        title=data.get('title'),
        location=data.get('location'),
        description=data.get('description'),
        start_date=start_date,
        end_date=end_date,
        target_donors=int(data.get('target_donors', 50)),
        blood_types_needed=', '.join(data.get('blood_types', [])),
        requirements=data.get('requirements', ''),
        notes=data.get('notes', ''),
        blood_bank=user,
        status='scheduled'
    )
    drive.save()
    
    return jsonify({"msg": "Drive scheduled successfully"}), 201