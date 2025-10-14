## we need to install PyJWT to generate and verify the JWT tokens in python.
## pwdlib is a package to handle password hashes. It supports many secure hashing algorithms and utilies to work with them. 

from datetime import datetime, timedelta, timezone
from models import Base 
import models
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session as SQLAlchemySession
from pwdlib import  PasswordHash
from database import get_db
from jose.exceptions import JWTError, ExpiredSignatureError ## pip install python-jose
## To get the secret key run this command openssl rand -hex 32

SECRET_KEY = "e0c37d98cdd6972b67741df691df55f7d223d53a7b123ee61496a07a9ad9c36e"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRES_MINUTES = 10

password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def  verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password):
    return password_hash.hash(password)


def create_access_token(data:dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
def get_user_by_email(db: SQLAlchemySession,email:str):
    return db.query(models.my_users).filter(models.my_users.email == email).first()


## In python all required arguments must come before all the default or optional arguments like if write db:SQLAlchemySession after the token gives error if not user depends

## Depends is fastapi dependency injection system and it gets the things ready before running the function

async def get_current_user(token: str = Depends(oauth2_scheme), db:SQLAlchemySession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"}
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = get_user_by_email(db, email)
    if user is None:
        raise credentials_exception
    return user





