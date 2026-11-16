from app import create_app
from app.models import User, BloodBank, Hospital, BloodDrive, BloodInventory, BloodRequest
from datetime import datetime, timedelta

def init_db():
    app = create_app()
    with app.app_context():
        print("Connecting to MongoDB and initializing sample records...")

        # 1. Admin User
        admin = User.objects(email='admin@gmail.com').first()
        if not admin:
            admin = User(
                email='admin@gmail.com',
                first_name='Admin',
                last_name='Officer',
                role='admin',
                phone='+91 98765 00001',
                address='Pune Health Division',
                is_active=True
            )
            admin.set_password('admin@123')
            admin.save()
            print("Created Admin user: admin@gmail.com / admin@123")

        # 2. Blood Bank User
        blood_bank = BloodBank.objects(email='bloodbank@example.com').first()
        if not blood_bank:
            blood_bank = BloodBank(
                email='bloodbank@example.com',
                first_name='Central',
                last_name='Blood Bank',
                name='Pune Central Blood Bank',
                role='blood_bank',
                phone='+91 98765 00002',
                address='Shivaji Nagar, Pune',
                is_active=True
            )
            blood_bank.set_password('bank123')
            blood_bank.save()
            print("Created Blood Bank: bloodbank@example.com / bank123")

        # 3. Hospital User
        hospital = Hospital.objects(email='hospital@example.com').first()
        if not hospital:
            hospital = Hospital(
                email='hospital@example.com',
                first_name='City',
                last_name='General',
                name='City General Hospital Pune',
                role='hospital',
                phone='+91 98765 00003',
                address='FC Road, Pune',
                is_active=True
            )
            hospital.set_password('hospital123')
            hospital.save()
            print("Created Hospital: hospital@example.com / hospital123")

        # 4. Donor User
        donor = User.objects(email='donor@example.com').first()
        if not donor:
            donor = User(
                email='donor@example.com',
                first_name='Rahul',
                last_name='Sharma',
                role='donor',
                blood_type='O+',
                phone='+91 98765 00004',
                address='Kothrud, Pune',
                is_active=True
            )
            donor.set_password('donor123')
            donor.save()
            print("Created Donor: donor@example.com / donor123")

        # 5. Blood Inventory
        groups = [
            ('A+', 45), ('A-', 12), ('B+', 38), ('B-', 8),
            ('AB+', 25), ('AB-', 4), ('O+', 50), ('O-', 15)
        ]
        for bg, units in groups:
            item = BloodInventory.objects(blood_bank=blood_bank, blood_type=bg).first()
            if not item:
                item = BloodInventory(
                    blood_bank=blood_bank,
                    blood_type=bg,
                    units_available=units
                )
                item.save()
        print("Seeded blood inventory items.")

        # 6. Sample Blood Drives
        if BloodDrive.objects(blood_bank=blood_bank).count() == 0:
            drive1 = BloodDrive(
                blood_bank=blood_bank,
                title='Pune Youth Blood Donation Camp',
                location='Shivaji Nagar Community Hall, Pune',
                description='Annual youth blood donation drive in partnership with Red Cross.',
                start_date=datetime.utcnow() + timedelta(days=5),
                end_date=datetime.utcnow() + timedelta(days=5, hours=8),
                target_donors=100,
                blood_types_needed='O+, A+, B+, AB+',
                status='scheduled'
            )
            drive1.save()

            drive2 = BloodDrive(
                blood_bank=blood_bank,
                title='Emergency Monsoon Blood Collection',
                location='City Hospital Campus, Pune',
                description='Urgent drive to replenish platelet and negative blood supplies.',
                start_date=datetime.utcnow() + timedelta(days=12),
                end_date=datetime.utcnow() + timedelta(days=12, hours=6),
                target_donors=60,
                blood_types_needed='O-, B-, AB-',
                status='scheduled'
            )
            drive2.save()
            print("Seeded sample blood drives.")

        # 7. Sample Blood Requests
        if BloodRequest.objects(hospital=hospital).count() == 0:
            req1 = BloodRequest(
                hospital=hospital,
                blood_type='O-',
                units_needed=4,
                priority='CRITICAL',
                patient_details='Emergency cardiac bypass surgery in ICU',
                deadline=datetime.utcnow() + timedelta(hours=24),
                status='PENDING'
            )
            req1.save()
            print("Seeded urgent blood request.")

        print("\nAll sample seed data created successfully!")

if __name__ == '__main__':
    init_db()
