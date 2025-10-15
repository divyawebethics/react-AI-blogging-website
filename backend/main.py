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
        admin_role = db.query(models.Role).filter(models.Role.name == "admin").first()
        if not admin_role:
            admin_role = models.Role(name="admin")
            db.add(admin_role)
            db.flush()  
        
        user_role = db.query(models.Role).filter(models.Role.name == "user").first()
        if not user_role:
            user_role = models.Role(name="user")
            db.add(user_role)
            db.flush()
        
        db.commit()
        
        admin_email = "admin@gmail.com"
        admin_user = db.query(models.my_users).filter(models.my_users.email == admin_email).first()

        if not admin_user:
            hashed_pw = get_password_hash("Admin123")
            new_admin = models.my_users(
                first_name="Admin",
                last_name="User",
                email=admin_email,
                password=hashed_pw,
                role_id=admin_role.id  
            )
            db.add(new_admin)
            print(f"✅ Admin user created with role_id: {admin_role.id}")
        else:
            admin_user.role_id = admin_role.id
            print(f"✅ Existing admin user updated with role_id: {admin_role.id}")
        
        db.commit()
        
        print("🔍 Verifying role setup:")
        roles = db.query(models.Role).all()
        for role in roles:
            print(f"   - {role.name}: id={role.id}")
            
        admin_check = db.query(models.my_users).filter(models.my_users.email == "admin@gmail.com").first()
        if admin_check:
            print(f"✅ Admin user has role_id: {admin_check.role_id}")

    except Exception as e:
        print(f"❌ Error during startup: {e}")
        db.rollback()
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