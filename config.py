import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'd49f9a6b4fd10aef72697d037bddc087705cc09eb27fd9f3e6a08cb2138c9df2'
    
    # Database URI - Uses environment variable, falls back to SQLite, with RDS as an alternative option
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
                              'sqlite:///app.db'

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Mail settings (जर नको असतील तर काढून टाका)
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'your_email@gmail.com'
    MAIL_PASSWORD = 'your_email_password'

    # Admin email
    ADMINS = ['your-email@example.com']

    # Blood types
    BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

    # Donation eligibility period (in days)
    DONATION_ELIGIBILITY_DAYS = 56

    # Emergency request priority levels
    PRIORITY_LEVELS = {
        'CRITICAL': 1,
        'HIGH': 2,
        'MEDIUM': 3,
        'LOW': 4
    }
