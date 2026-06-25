from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, BloodRequest, Donation, BloodInventory, BloodDrive
from functools import wraps

bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.objects(id=user_id).first()
        if not user or user.role != 'admin':
            return jsonify({"msg": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

@bp.route('/dashboard', methods=['GET'])
@admin_required
def dashboard():
    pending_requests = BloodRequest.objects(status='PENDING').order_by('-created_at')
    pending_donations = Donation.objects(status='PENDING').order_by('-created_at')
    total_donors = User.objects(role='donor').count()
    blood_drives = BloodDrive.objects().order_by('-start_date').limit(5)
    
    return jsonify({
        "pending_requests": [{
            "id": str(r.id),
            "blood_type": r.blood_type,
            "units_needed": r.units_needed,
            "hospital_name": r.hospital.name if r.hospital else "Unknown",
            "priority": r.priority,
            "date": r.created_at.isoformat()
        } for r in pending_requests],
        "pending_donations": [{
            "id": str(d.id),
            "blood_type": d.blood_type,
            "units": d.units,
            "donor_name": f"{d.donor.first_name} {d.donor.last_name}",
            "date": d.donation_date.isoformat()
        } for d in pending_donations],
        "total_donors": total_donors,
        "recent_drives": [{
            "id": str(d.id),
            "title": d.title,
            "date": d.start_date.isoformat(),
            "status": d.status
        } for d in blood_drives]
    }), 200

@bp.route('/blood-request/<request_id>/<action>', methods=['POST'])
@admin_required
def manage_blood_request(request_id, action):
    blood_request = BloodRequest.objects(id=request_id).first()
    if not blood_request:
        return jsonify({"msg": "Request not found"}), 404
        
    if action == 'accept':
        blood_request.status = 'ACCEPTED'
        blood_inventory = BloodInventory.objects(blood_type=blood_request.blood_type).first()
        if blood_inventory and blood_inventory.units_available >= blood_request.units_needed:
            blood_inventory.units_available -= blood_request.units_needed
            blood_inventory.save()
        else:
            blood_request.status = 'REJECTED'
            blood_request.save()
            return jsonify({"msg": "Not enough blood in inventory"}), 400
    elif action == 'reject':
        blood_request.status = 'REJECTED'
    else:
        return jsonify({"msg": "Invalid action"}), 400
        
    blood_request.save()
    return jsonify({"msg": f"Blood request {action}ed successfully"}), 200

@bp.route('/donation/<donation_id>/<action>', methods=['POST'])
@admin_required
def manage_donation(donation_id, action):
    donation = Donation.objects(id=donation_id).first()
    if not donation:
        return jsonify({"msg": "Donation not found"}), 404
        
    if action == 'accept':
        donation.status = 'COMPLETED'
        blood_inventory = BloodInventory.objects(blood_type=donation.blood_type).first()
        if blood_inventory:
            blood_inventory.units_available += donation.units
            blood_inventory.save()
        else:
            first_blood_bank = User.objects(role='blood_bank').first()
            if first_blood_bank:
                new_inventory = BloodInventory(blood_bank=first_blood_bank, blood_type=donation.blood_type, units_available=donation.units) 
                new_inventory.save()
            else:
                donation.status = 'REJECTED'
                donation.save()
                return jsonify({"msg": "No blood bank found to assign inventory"}), 400
    elif action == 'reject':
        donation.status = 'REJECTED'
    else:
        return jsonify({"msg": "Invalid action"}), 400
        
    donation.save()
    return jsonify({"msg": f"Donation {action}ed successfully"}), 200