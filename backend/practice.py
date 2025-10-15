from fastapi import FastAPI, HTTPException, Depends, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
import crud, models, os
from database import engine, get_db
from pydantic_models import (
    UserIn, UserLogin, UserOut, UserOutWithToken, Token,
    CategoryCreate, CategoryUpdate, CategoryModel,
    PostResponse, PostUpdate, PostCreate
)
from AuthMethods import get_password_hash, get_current_user, get_user_by_email, verify_password, create_access_token, get_admin_user
from datetime import timedelta
from dotenv import load_dotenv
import os 
from database import SessionLocal


ACCESS_TOKEN_EXPIRE_MINUTES = 30 

BASE_URL = "http://localhost:8080"


load_dotenv()
admin_email = os.getenv("ADMIN_EMAIL")
admin_password = os.getenv("ADMIN_PASSWORD")
app = FastAPI()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(models.Role).filter(models.Role.name == "admin").first():
            db.add(models.Role(name="admin"))
        if not db.query(models.Role).filter(models.Role.name == "user").first():
            db.add(models.Role(name="user"))
        db.commit()

    finally:
        db.close()


def get_full_image_url(image_path: str | None) -> str | None:
    if not image_path:
        return None
    return f"{BASE_URL}{image_path}"

@app.post("/signup", response_model=UserOutWithToken)
async def signup(user: UserIn, db: Session = Depends(get_db)):
    existing_user = db.query(models.my_users).filter(models.my_users.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_role = db.query(models.Role).filter(models.Role.name == 'user').first()
    if not user_role:
        raise HTTPException(status_code=400, detail="User role not found in database")
    
    hashed_pw = get_password_hash(user.password)

    new_user = models.my_users(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=hashed_pw,
        role_id=user_role.id
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    token = create_access_token(data={"sub": new_user.email})

    return UserOutWithToken(
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        email=new_user.email,
        access_token=token  
    )

@app.post("/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    print("Login attempt:", user.email, user.password)  
    user_db = db.query(models.my_users).options(joinedload(models.my_users.role)).filter(models.my_users.email == user.email).first()
    if not user_db or not verify_password(user.password, user_db.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    token = create_access_token(
        data={"sub": user_db.email, "role": user_db.role.name},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": token, "token_type": "bearer", "role": user_db.role.name}

@app.get("/debug-password")
def debug_password(db: Session = Depends(get_db)):
    user = db.query(models.my_users).filter(models.my_users.email == "admin@gmail.com").first()
    if not user:
        return {"error": "Admin not found"}
    
    test_password = "Admin123"  
    from AuthMethods import verify_password
    is_valid = verify_password(test_password, user.password)
    return {"password_valid": is_valid}

@app.post("/categories/", response_model=CategoryModel, dependencies = [Depends(get_admin_user)])
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db, category)

@app.get("/categories/", response_model=list[CategoryModel])
def get_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)

@app.put("/categories/{category_id}", dependencies = [Depends(get_admin_user)])
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    db_cat = crud.update_category(db, category_id, category)
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_cat

@app.delete("/categories/{category_id}", dependencies = [Depends(get_admin_user)])
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_cat = crud.delete_category(db, category_id)
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

@app.post("/posts/", response_model=PostResponse)
def create_post_endpoint(
    title: str = Form(...),
    description: str = Form(...),
    body: str = Form(...),
    category_id: int = Form(...),
    is_private: bool = Form(False),
    image: UploadFile | None = File(None),
    current_user: models.my_users = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        db_post = crud.create_post(
            db=db,
            title=title,
            description=description,
            body=body,
            category_id=category_id,
            user_id=current_user.id,  
            is_private=is_private,
            image=image
        )
        
        response_data = {
            "id": db_post.id,
            "title": db_post.title,
            "description": db_post.description,
            "body": db_post.body,
            "image_url": get_full_image_url(db_post.image_url),
            "category_id": db_post.category_id,
            "category": db_post.category.name if db_post.category else None,
            "is_private": db_post.is_private,
            "created_at": db_post.created_at,
            "updated_at": db_post.updated_at
        }
        
        return PostResponse(**response_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating post: {str(e)}")

@app.get("/posts/", response_model=list[PostResponse])
def get_posts_endpoint(current_user: models.my_users = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.name == "admin":
        posts = crud.get_posts_for_admin(db)
    else:
        posts = crud.get_posts_for_user(db, current_user.id)  # FIX: Added assignment and user_id
    
    try:
        response_posts = []
        for post in posts:
            response_data = {
                "id": post.id,
                "title": post.title,
                "description": post.description,
                "body": post.body,
                "image_url": get_full_image_url(post.image_url),
                "category_id": post.category_id,
                "category": post.category.name if post.category else None,
                "is_private": post.is_private,
                "created_at": post.created_at,
                "updated_at": post.updated_at
            }
            response_posts.append(PostResponse(**response_data))
        return response_posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching posts: {str(e)}")
    
@app.get("/posts/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    response_data = {
        "id": post.id,
        "title": post.title,
        "description": post.description,
        "body": post.body,
        "image_url": get_full_image_url(post.image_url),
        "category_id": post.category_id,
        "category": post.category.name if post.category else None,
        "is_private": post.is_private,
        "created_at": post.created_at,
        "updated_at": post.updated_at
    }
    return PostResponse(**response_data)


@app.get("/", response_model=list[PostResponse])
def get_landing_posts(db:Session = Depends(get_db)):
    posts = crud.get_posts_for_landing(db)
    return [
        PostResponse(
            id=p.id,
            title=p.title,
            description=p.description,
            body=p.body,
            image_url=get_full_image_url(p.image_url),
            category_id=p.category_id,
            category=p.category.name if p.category else None,
            is_private=p.is_private,
            created_at=p.created_at,
            updated_at=p.updated_at
        )
        for p in posts
    ]

@app.put("/posts/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    title: str = Form(None),
    description: str = Form(None),
    body: str = Form(None),
    category_id: int = Form(None),
    is_private: bool = Form(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    post_data = PostUpdate(
        title=title, 
        description=description, 
        body=body, 
        category_id=category_id, 
        is_private=is_private
    )
    updated = crud.update_post(db, post_id, post_data, image)
    if not updated:
        raise HTTPException(status_code=404, detail="Post not found")
    
    response_data = {
        "id": updated.id,
        "title": updated.title,
        "description": updated.description,
        "body": updated.body,
        "image_url": get_full_image_url(updated.image_url),
        "category_id": updated.category_id,
        "category": updated.category.name if updated.category else None,
        "is_private": updated.is_private,
        "created_at": updated.created_at,
        "updated_at": updated.updated_at
    }
    return PostResponse(**response_data)

@app.delete("/posts/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_post(db, post_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)


above is main.py File

# models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Text, Boolean
from sqlalchemy.orm import DeclarativeBase, relationship

class Base(DeclarativeBase):
    pass


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

    users = relationship("my_users", back_populates="role")


class my_users(Base):
    __tablename__ = "my_users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)

    role = relationship("Role", back_populates="users")

    posts = relationship("Post", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    posts = relationship("Post", back_populates="category", cascade="all, delete-orphan")


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    body = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("my_users.id"), nullable=False)
    is_private = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    category = relationship("Category", back_populates="posts")
    user = relationship("my_users", back_populates="posts")

above is models.py file 

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
async def get_current_user(token: str = Depends(oauth2_scheme), db: SQLAlchemySession = Depends(get_db)) -> models.my_users:
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
    
    from sqlalchemy.orm import joinedload
    user = db.query(models.my_users).options(joinedload(models.my_users.role)).filter(models.my_users.email == email).first()
    
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return current_user

async def get_admin_user(current_user = Depends(get_current_user), db:SQLAlchemySession = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not Authenticated")
    user_role = db.query(models.Role).filter(models.Role.id == current_user.role_id).first()
    if not user_role or user_role.name != 'admin':
        raise HTTPException(status_code = status.HTTP_403_FORBIDDEN, detail= "Admin access required")
    
    return current_user

above is AuthMethods.py file 

# crud.py
import os
import shutil
from sqlalchemy.orm import Session
import models
from pydantic_models import CategoryCreate, CategoryUpdate, PostUpdate
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def create_category(db: Session, category: CategoryCreate):
    db_cat = models.Category(name=category.name)
    db.add(db_cat)
    db.commit()
    db.refresh(db_cat)
    return db_cat

def get_categories(db: Session):
    return db.query(models.Category).all()

def update_category(db: Session, category_id: int, category: CategoryUpdate):
    db_cat = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_cat:
        return None
    db_cat.name = category.name
    db.commit()
    db.refresh(db_cat)
    return db_cat

def delete_category(db: Session, category_id: int):
    db_cat = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_cat:
        return None
    db.delete(db_cat)
    db.commit()
    return True

def create_post(
    db: Session,
    title: str,
    description: str,
    body: str,
    category_id: int,
    user_id: int,
    is_private: bool = False,
    image: UploadFile | None = None,
):
    image_url = None
    if image and image.filename:
        file_location = os.path.join(UPLOAD_DIR, image.filename)
        with open(file_location, "wb+") as f:
            contents = image.file.read()
            f.write(contents)
        image_url = f"/uploads/{image.filename}"

    db_post = models.Post(
        title=title,
        description=description,
        body=body,
        category_id=category_id,
        user_id=user_id,
        is_private=is_private,
        image_url=image_url,
    )

    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_posts_for_landing(db:Session):
    return db.query(models.Post).filter(models.Post.is_private == False).all()

def get_posts_for_user(db:Session, user_id: int):
    return db.query(models.Post).filter(
        (models.Post.is_private == False) | (models.Post.user_id == user_id)
    ).all()

def get_posts_for_admin(db:Session):
    return db.query(models.Post).all()

def get_post(db: Session, post_id: int):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    return post

def update_post(db: Session, post_id: int, post: PostUpdate, image: UploadFile | None = None):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        return None

    update_data = post.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_post, key, value)

    if image and image.filename:
        file_location = os.path.join(UPLOAD_DIR, image.filename)
        with open(file_location, "wb+") as f:
            contents = image.file.read()
            f.write(contents)
        db_post.image_url = f"/uploads/{image.filename}"

    db.commit()
    db.refresh(db_post)

    db_post.category_name = db_post.category.name if db_post.category else None

    return db_post

def delete_post(db: Session, post_id: int):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        return None
    db.delete(db_post)
    db.commit()
    return True

above is crud.py


from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UserIn(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: Optional[str] = None  

class TokenData(BaseModel):
    name: Optional[str] = None

class UserOutBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    role: Optional[str] = None  

class UserOut(UserOutBase):
    pass

class UserOutWithToken(UserOutBase):
    access_token: str

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryCreate):
    name: str

class CategoryModel(CategoryBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class PostBase(BaseModel):
    title: str
    description: str
    category_id: Optional[int] = None
    body: str
    is_private: bool = False
    image_url: Optional[str] = None

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    body: Optional[str] = None
    is_private: Optional[bool] = None

class PostResponse(BaseModel):
    id: int
    title: str
    description: str
    body: str
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    category: Optional[str] = None
    is_private: bool
    created_at: datetime
    updated_at: datetime
    owner: Optional[str] = None 

    model_config = ConfigDict(from_attributes=True)

above is pydantic_models.py file 

