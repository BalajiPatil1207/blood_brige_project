from flask import Blueprint, jsonify, request
from app.models import BloodRequest, BloodDrive, BloodInventory
from datetime import datetime

bp = Blueprint('main', __name__, url_prefix='/api/main')

@bp.route('/home', methods=['GET'])
def index():
    upcoming_drives = BloodDrive.objects(
        start_date__gt=datetime.utcnow(),
        status='UPCOMING'
    ).order_by('start_date').limit(3)
    
    urgent_requests = BloodRequest.objects(
        status='PENDING',
        priority__in=['CRITICAL', 'HIGH']
    ).order_by('-created_at').limit(5)
    
    drives_data = [{
        "id": str(d.id),
        "title": d.title,
        "location": d.location,
        "start_date": d.start_date.isoformat(),
        "blood_types_needed": d.blood_types_needed
    } for d in upcoming_drives]
    
    requests_data = [{
        "id": str(r.id),
        "blood_type": r.blood_type,
        "units_needed": r.units_needed,
        "priority": r.priority,
        "location": r.hospital.name if r.hospital else "Unknown"
    } for r in urgent_requests]
    
    return jsonify({
        "upcoming_drives": drives_data,
        "urgent_requests": requests_data
    }), 200

@bp.route('/blood-drives', methods=['GET'])
def blood_drives():
    page = request.args.get('page', 1, type=int)
    drives = BloodDrive.objects(start_date__gt=datetime.utcnow()).order_by('start_date').paginate(page=page, per_page=9)
    
    return jsonify({
        "drives": [{
            "id": str(d.id),
            "title": d.title,
            "description": d.description,
            "location": d.location,
            "start_date": d.start_date.isoformat(),
            "end_date": d.end_date.isoformat(),
            "status": d.status,
            "blood_types_needed": d.blood_types_needed
        } for d in drives.items],
        "total_pages": drives.pages,
        "current_page": page
    }), 200

@bp.route('/emergency-requests', methods=['GET'])
def emergency_requests():
    page = request.args.get('page', 1, type=int)
    requests = BloodRequest.objects(
        status='PENDING',
        priority__in=['CRITICAL', 'HIGH']
    ).order_by('-created_at').paginate(page=page, per_page=10)
    
    return jsonify({
        "requests": [{
            "id": str(r.id),
            "blood_type": r.blood_type,
            "units_needed": r.units_needed,
            "priority": r.priority,
            "hospital_name": r.hospital.name if r.hospital else "Unknown",
            "created_at": r.created_at.isoformat()
        } for r in requests.items],
        "total_pages": requests.pages,
        "current_page": page
    }), 200

@bp.route('/blood-inventory', methods=['GET'])
def blood_inventory():
    inventory_records = BloodInventory.objects()
    inventory = {}
    for record in inventory_records:
        inventory[record.blood_type] = inventory.get(record.blood_type, 0) + record.units_available
    
    return jsonify({"inventory": inventory}), 200