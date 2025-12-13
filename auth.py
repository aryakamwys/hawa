from datetime import datetime, timedelta
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from typing import TYPE_CHECKING

from app.core.config import get_settings
from app.core.dependencies import get_current_user
from app.db.postgres import get_db

from app.services.email.email_service import send_verification_email, generate_otp
from fastapi import BackgroundTasks

if TYPE_CHECKING:
    from app.db.models.user import User
from app.services.auth.schemas import (
    RegisterRequest,
    UserResponse,
    LoginRequest,
    TokenResponse,
    PromoteToAdminRequest,
    UpdateProfileRequest,
    UpdateAlertSettingsRequest,
)
from app.services.auth.service import AuthService
# Import User for profile update checks
from app.db.models.user import User


router = APIRouter(prefix="/auth", tags=["auth"])
class VerifyRequest(BaseModel):
    email: EmailStr
    otp: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    try:
        created_user = service.register_user(
            full_name=payload.full_name,
            email=payload.email,
            phone_e164=payload.phone_e164,
            password=payload.password,
            locale=payload.locale,
            language=payload.language,
        )

    
        otp = generate_otp()

        hashed_otp = hashlib.sha256(otp.encode()).hexdigest()

        db_user = db.query(User).filter(User.email == payload.email).first()
        if db_user:
            db_user.verification_code = hashed_otp  
            db_user.verification_expires_at = datetime.utcnow() + timedelta(minutes=10) 
            db_user.otp_attempts = 0
            db_user.is_verified = False
            db.commit()

          
            await send_verification_email(db_user.email, otp)
        
        return {"message": "Registration successful. Please check your email for the verification code."}

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    try:
        service = AuthService(db)
        token = service.authenticate_user(email=payload.email, password=payload.password)
        if token is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
        
        # Get user to include role in response
        from app.db.models.user import User
        user = db.query(User).filter(User.email == payload.email).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )
        
        return TokenResponse(
            access_token=token,
            role=user.role.value  # "user", "admin", or "industry"
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = str(e)
        print(f"Error in login endpoint: {error_detail}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {error_detail}"
        )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: "User" = Depends(get_current_user)):
    """Get current authenticated user information including role.
    
    Frontend bisa gunakan endpoint ini untuk:
    1. Verify token masih valid
    2. Get user info termasuk role untuk redirect ke dashboard yang sesuai
    """
    return UserResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone_e164=current_user.phone_e164,
        locale=current_user.locale,
        language=current_user.language.value if current_user.language else None,
        role=current_user.role.value,  # "user", "admin", or "industry"
        age=current_user.age,
        occupation=current_user.occupation,
        location=current_user.location,
        activity_level=current_user.activity_level,
        sensitivity_level=current_user.sensitivity_level,
        privacy_consent=current_user.privacy_consent,
        alert_pm25_threshold=current_user.alert_pm25_threshold,
        alert_pm10_threshold=current_user.alert_pm10_threshold,
        alert_enabled=current_user.alert_enabled,
        alert_methods=current_user.alert_methods,
        alert_frequency=current_user.alert_frequency,
    )


@router.post("/promote-admin", response_model=UserResponse)
def promote_to_admin(payload: PromoteToAdminRequest, db: Session = Depends(get_db)):
    """Promote a user to admin role. Requires ADMIN_SECRET_KEY."""
    settings = get_settings()
    if payload.admin_secret != settings.admin_secret_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin secret key",
        )
    service = AuthService(db)
    try:
        user = service.promote_to_admin(user_id=payload.user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return user


@router.put("/profile", response_model=UserResponse, status_code=status.HTTP_200_OK)
def update_user_profile(
    payload: UpdateProfileRequest,
    current_user: "User" = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile - user bisa edit semua field profile mereka
    
    Semua field optional - hanya field yang dikirim yang akan di-update.
    Health conditions akan di-encrypt sebelum disimpan.
    """
    from app.core.privacy import get_privacy_protocol, DataClassification
    from datetime import datetime, timezone
    
    # Update basic fields
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    
    # Update phone number (dengan validasi format E.164)
    if payload.phone_e164 is not None:
        # Check jika nomor sudah digunakan user lain
        existing_user = db.query(User).filter(
            User.phone_e164 == payload.phone_e164,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number already registered by another user"
            )
        current_user.phone_e164 = payload.phone_e164.strip() if payload.phone_e164 else None
    
    # Update language (bisa diganti di profile FE)
    if payload.language is not None:
        current_user.language = payload.language
    
    # Update personalisasi fields
    if payload.age is not None:
        current_user.age = payload.age
    if payload.occupation is not None:
        current_user.occupation = payload.occupation
    if payload.location is not None:
        current_user.location = payload.location
    if payload.activity_level is not None:
        current_user.activity_level = payload.activity_level
    if payload.sensitivity_level is not None:
        current_user.sensitivity_level = payload.sensitivity_level
    
    # Encrypt health conditions jika ada
    if payload.health_conditions is not None:
        protocol = get_privacy_protocol()
        current_user.health_conditions_encrypted = protocol.encrypt_sensitive_data(
            payload.health_conditions,
            DataClassification.RESTRICTED
        )
    
    # Update privacy consent
    if payload.privacy_consent is not None:
        current_user.privacy_consent = payload.privacy_consent
        if payload.privacy_consent:
            current_user.privacy_consent_date = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse(
        id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone_e164=current_user.phone_e164,
        locale=current_user.locale,
        language=current_user.language.value if current_user.language else None,
        role=current_user.role.value,
        age=current_user.age,
        occupation=current_user.occupation,
        location=current_user.location,
        activity_level=current_user.activity_level,
        sensitivity_level=current_user.sensitivity_level,
        privacy_consent=current_user.privacy_consent,
        alert_pm25_threshold=current_user.alert_pm25_threshold,
        alert_pm10_threshold=current_user.alert_pm10_threshold,
        alert_enabled=current_user.alert_enabled,
        alert_methods=current_user.alert_methods,
        alert_frequency=current_user.alert_frequency,
    )

from pydantic import BaseModel

@router.post("/verify-otp")
async def verify_otp(data: VerifyRequest, db: Session = Depends(get_db)):
    """
    Verifies the user's OTP with rate limiting and expiration checks.
    """
   
    user = db.query(User).filter(User.email == data.email).first()

   
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
        
    if user.is_verified:
        return {"message": "User is already verified"}

    
    if not user.verification_expires_at or datetime.utcnow() > user.verification_expires_at:
        raise HTTPException(status_code=400, detail="Invalid or expired code")

   
    if user.otp_attempts >= 5:
        raise HTTPException(
            status_code=429,
            detail="Too many attempts. Please request a new code."
        )

   
    input_hashed_otp = hashlib.sha256(data.otp.encode()).hexdigest()

  
    if user.verification_code != input_hashed_otp:
      
        user.otp_attempts += 1
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid verification code")

   
    user.is_verified = True
    user.verification_code = None
    user.verification_expires_at = None
    user.otp_attempts = 0
    db.commit()

    return {"message": "Verification successful! You can now login."}

