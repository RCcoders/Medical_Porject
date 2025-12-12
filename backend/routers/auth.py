from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import crud, schemas, auth, models
from ..database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate OTP
    import random
    otp_code = str(random.randint(100000, 999999))
    crud.create_otp(db, email=user.email, otp_code=otp_code)
    
    # Log OTP to console (Simulation)
    print(f"--------------------------------------------------")
    print(f"OTP for {user.email}: {otp_code}")
    print(f"--------------------------------------------------")
    
    return crud.create_user(db=db, user=user)

@router.post("/verify-otp")
def verify_otp(verification: schemas.OTPVerify, db: Session = Depends(get_db)):
    otp_record = crud.get_otp(db, email=verification.email)
    if not otp_record:
        raise HTTPException(status_code=400, detail="Invalid OTP or OTP expired")
    
    if otp_record.otp_code != verification.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    # Verify user
    user = crud.get_user_by_email(db, email=verification.email)
    if user:
        user.is_verified = True
        db.commit()
        
    # Delete OTP
    crud.delete_otp(db, email=verification.email)
    
    return {"message": "Email verified successfully"}

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    

        
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        subject=user.email, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except auth.JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: schemas.User = Depends(get_current_user)):
    return current_user
