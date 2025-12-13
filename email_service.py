import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr


MAIL_USERNAME = "hawa.verify@gmail.com"  
MAIL_PASSWORD = "inch wjzy lwtg meag"
# -----------------------------


if "your.new.email" in MAIL_USERNAME:
    print("WARNING: You haven't replaced the placeholder email in email_service.py yet!")

conf = ConnectionConfig(
    MAIL_USERNAME=MAIL_USERNAME,
    MAIL_PASSWORD=MAIL_PASSWORD,
    MAIL_FROM=MAIL_USERNAME,
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

def generate_otp(length=6):
    """Generate a random 6-digit numeric OTP"""
    import random
    import string
    return ''.join(random.choices(string.digits, k=length))

async def send_verification_email(email: EmailStr, otp: str):
    """Sends the OTP to the user's email"""
    
    html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333;">Welcome to HAWA!</h2>
        <p style="font-size: 16px; color: #555;">Please verify your account to continue. Your verification code is:</p>
        
        <div style="background-color: #f4f6f8; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #2563EB; letter-spacing: 5px; margin: 0; font-size: 32px;">{otp}</h1>
        </div>
        
        <p style="font-size: 14px; color: #777;">This code is valid for 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2024 HAWA Air Quality Monitoring</p>
    </div>
    """

    message = MessageSchema(
        subject="HAWA Verification Code",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    return True