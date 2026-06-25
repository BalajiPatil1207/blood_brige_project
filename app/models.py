from datetime import datetime
from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin, db.Document):
    meta = {'collection': 'users', 'allow_inheritance': True}
    
    email = db.StringField(required=True, unique=True, max_length=120)
    password_hash = db.StringField(max_length=256)
    first_name = db.StringField(required=True, max_length=50)
    last_name = db.StringField(required=True, max_length=50)
    phone = db.StringField(max_length=20)
    address = db.StringField(max_length=200)
    role = db.StringField(required=True, max_length=20)  # admin, donor, blood_bank, hospital
    is_active = db.BooleanField(default=True)
    created_at = db.DateTimeField(default=datetime.utcnow)
    
    # Donor specific fields
    blood_type = db.StringField(max_length=5)
    last_donation_date = db.DateTimeField()
    
    # For Flask-Login compatibility
    def get_id(self):
        return str(self.id)

    def __repr__(self):
        return f'<User {self.email}>'
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class BloodBank(User):
    name = db.StringField(required=True, max_length=100)
    
    def __repr__(self):
        return f'<BloodBank {self.name}>'

class Hospital(User):
    name = db.StringField(required=True, max_length=100)
    
    def __repr__(self):
        return f'<Hospital {self.name}>'

class EmergencyRequest(db.Document):
    meta = {'collection': 'emergency_requests'}
    
    blood_type = db.StringField(required=True, max_length=5)
    units_needed = db.IntField(required=True)
    priority = db.StringField(required=True, max_length=20)  # CRITICAL, HIGH, MEDIUM, LOW
    patient_details = db.StringField(required=True)
    deadline = db.DateTimeField(required=True)
    status = db.StringField(default='active', max_length=20)  # active, fulfilled, cancelled
    created_at = db.DateTimeField(default=datetime.utcnow)
    
    hospital = db.ReferenceField(Hospital, null=True, reverse_delete_rule=db.CASCADE)
    requester = db.ReferenceField(User, null=True, reverse_delete_rule=db.CASCADE)

    def __repr__(self):
        return f'<EmergencyRequest {self.blood_type} - {self.units_needed} units>'

class BloodRequest(db.Document):
    meta = {'collection': 'blood_requests'}
    
    hospital = db.ReferenceField(Hospital, required=True, reverse_delete_rule=db.CASCADE)
    blood_type = db.StringField(required=True, max_length=5)
    units_needed = db.IntField(required=True)
    priority = db.StringField(required=True, max_length=20)  # CRITICAL, HIGH, MEDIUM, LOW
    status = db.StringField(default='PENDING', max_length=20)  # PENDING, FULFILLED, CANCELLED
    patient_details = db.StringField()
    created_at = db.DateTimeField(default=datetime.utcnow)
    updated_at = db.DateTimeField(default=datetime.utcnow)
    deadline = db.DateTimeField()

    def __repr__(self):
        return f'<BloodRequest {self.id} - {self.blood_type}>'

class BloodDrive(db.Document):
    meta = {'collection': 'blood_drives'}
    
    title = db.StringField(required=True, max_length=100)
    location = db.StringField(required=True, max_length=200)
    description = db.StringField()
    start_date = db.DateTimeField(required=True)
    end_date = db.DateTimeField(required=True)
    target_donors = db.IntField(required=True)
    blood_types_needed = db.StringField(max_length=100)
    requirements = db.StringField()
    notes = db.StringField()
    status = db.StringField(default='scheduled', max_length=20)
    created_at = db.DateTimeField(default=datetime.utcnow)
    
    blood_bank = db.ReferenceField(User, required=True, reverse_delete_rule=db.CASCADE)
    
    def __repr__(self):
        return f'<BloodDrive {self.title}>'
    
    @property
    def is_upcoming(self):
        return self.start_date > datetime.utcnow()
    
    @property
    def is_completed(self):
        return self.end_date < datetime.utcnow()
    
    @property
    def registration_count(self):
        return DriveRegistration.objects(blood_drive=self).count()
    
    @property
    def donation_count(self):
        return Donation.objects(blood_drive=self).count()
    
    @property
    def progress_percentage(self):
        if self.target_donors == 0:
            return 0
        return min(100, (self.donation_count / self.target_donors) * 100)

class Donation(db.Document):
    meta = {'collection': 'donations'}
    
    donor = db.ReferenceField(User, required=True, reverse_delete_rule=db.CASCADE)
    blood_drive = db.ReferenceField(BloodDrive, null=True, reverse_delete_rule=db.CASCADE)
    blood_request = db.ReferenceField(BloodRequest, null=True, reverse_delete_rule=db.CASCADE)
    
    donation_date = db.DateTimeField(default=datetime.utcnow)
    blood_type = db.StringField(required=True, max_length=5)
    units = db.IntField(default=1)
    status = db.StringField(default='pending', max_length=20)  # pending, approved, rejected
    notes = db.StringField()
    
    def __repr__(self):
        return f'<Donation {self.donor.email} - {self.blood_type}>'

class DriveRegistration(db.Document):
    meta = {'collection': 'drive_registrations'}
    
    donor = db.ReferenceField(User, required=True, reverse_delete_rule=db.CASCADE)
    blood_drive = db.ReferenceField(BloodDrive, required=True, reverse_delete_rule=db.CASCADE)
    
    registration_date = db.DateTimeField(default=datetime.utcnow)
    status = db.StringField(default='registered', max_length=20)
    notes = db.StringField()
    
    def __repr__(self):
        return f'<DriveRegistration {self.donor.first_name} - {self.blood_drive.title}>'
    
    @property
    def is_confirmed(self):
        return self.status == 'confirmed'
    
    @property
    def is_cancelled(self):
        return self.status == 'cancelled'

class BloodInventory(db.Document):
    meta = {'collection': 'blood_inventory'}
    
    blood_bank = db.ReferenceField(BloodBank, null=True, reverse_delete_rule=db.CASCADE)
    blood_type = db.StringField(required=True, max_length=5)
    units_available = db.IntField(default=0)
    last_updated = db.DateTimeField(default=datetime.utcnow)

    def __repr__(self):
        return f'<BloodInventory {self.blood_type} - {self.units_available} units>'

class Notification(db.Document):
    meta = {'collection': 'notifications'}
    
    user = db.ReferenceField(User, required=True, reverse_delete_rule=db.CASCADE)
    message = db.StringField(required=True)
    is_read = db.BooleanField(default=False)
    created_at = db.DateTimeField(default=datetime.utcnow)
    related_request = db.ReferenceField(BloodRequest, null=True)

    def __repr__(self):
        return f'<Notification {self.user.email} - Read: {self.is_read}>'