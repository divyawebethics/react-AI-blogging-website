from fastapi import FastAPI, HTTPException, Depends, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import crud, models, os
from database import engine, get_db
from pydantic_models import (
    UserIn, UserLogin, UserOut, UserOutWithToken, Token,
    CategoryCreate, CategoryUpdate, CategoryModel,
    PostResponse, PostUpdate, PostCreate
)
from AuthMethods import get_password_hash, get_current_user, get_user_by_email, verify_password, create_access_token
from datetime import timedelta

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

ACCESS_TOKEN_EXPIRE_MINUTES = 30

BASE_URL = "http://localhost:8080"

def get_full_image_url(image_path: str | None) -> str | None:
    if not image_path:
        return None
    return f"{BASE_URL}{image_path}"

@app.post("/signup", response_model=UserOutWithToken)
async def signup(user: UserIn, db: Session = Depends(get_db)):
    existing_user = db.query(models.my_users).filter(models.my_users.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user.password)
    user_data = user.dict()
    user_data["password"] = hashed_pw
    new_user = models.my_users(**user_data)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.email})
    return UserOutWithToken(**user.dict(), access_token=token)

@app.post("/login", response_model=Token)
async def login(user: UserLogin, db: Session = Depends(get_db)):
    user_db = get_user_by_email(db, user.email)
    if not user_db or not verify_password(user.password, user_db.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": user_db.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": token}

@app.post("/categories/", response_model=CategoryModel)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db, category)

@app.get("/categories/", response_model=list[CategoryModel])
def get_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)

@app.put("/categories/{category_id}")
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    db_cat = crud.update_category(db, category_id, category)
    if not db_cat:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_cat

@app.delete("/categories/{category_id}")
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
    db: Session = Depends(get_db)
):
    try:
        db_post = crud.create_post(
            db=db,
            title=title,
            description=description,
            body=body,
            category_id=category_id,
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
def get_posts_endpoint(db: Session = Depends(get_db)):
    try:
        posts = crud.get_posts(db)
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