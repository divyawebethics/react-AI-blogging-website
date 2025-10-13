from fastapi import FastAPI, HTTPException, Depends, status, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
from datetime import timedelta
from sqlalchemy.orm import Session 
from database import engine, get_db
import models, crud
from models import Base, Category
from pydantic_models import UserIn, UserOut, UserLogin, Token, UserOutWithToken, CategoryCreate, CategoryUpdate, CategoryModel, PostResponse, PostCreate, PostUpdate
from AuthMethods import (
    get_password_hash,
    get_current_user,
    get_user_by_email,
    verify_password,
    create_access_token,
)

app = FastAPI()

# origins = [
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
# ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],   
    allow_headers=["*"],  
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully")

ACCESS_TOKEN_EXPIRES_MINUTES = 15

@app.post("/signup", response_model=UserOutWithToken)
async def signup(user: UserIn, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(models.my_users).filter(models.my_users.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = get_password_hash(user.password)
        new_user = models.my_users(
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            password=hashed_password,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        access_token = create_access_token(data={"sub": new_user.email})
        return UserOutWithToken(
            first_name=new_user.first_name,
            last_name=new_user.last_name,
            email=new_user.email,
            access_token=access_token,
        )
    except Exception as e:
        print("Signup error:", e) 
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/login", response_model=Token)
async def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email(db, user_in.email)

    if not user or not verify_password(user_in.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRES_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token}


@app.get("/profile", response_model=UserOut)
async def get_profile(current_user: models.my_users = Depends(get_current_user)):
    return UserOut(
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email=current_user.email,
    )


@app.put("/profile", response_model=UserOut)
async def update_profile(
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    current_user: models.my_users = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = current_user
    user.first_name = first_name
    user.last_name = last_name
    user.email = email

    db.commit()
    db.refresh(user)

    return UserOut(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
    )


@app.post("/categories/", response_model = CategoryModel)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    return crud.create_category(db, category)

@app.get("/categories/", response_model=list[CategoryModel])
def get_categories(db:Session = Depends(get_db)):
    return crud.get_categories(db)

@app.get("/categories/{category_id}", response_model=CategoryModel)
def get_category(category_id: int, db:Session = Depends(get_db)):
    category = crud.get_category(category_id)
    if not category:
        raise HTTPException(status_code=404,detail="Category not found")
    return category

@app.put("/categories/{category_id}")
def update_category(category_id: int, category: CategoryUpdate, db: Session = Depends(get_db)):
    db_category = crud.update_category(db, category_id, category)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category


@app.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}


@app.get("/posts/" , response_model=list[PostResponse])
def read_posts(skip:int = 0, limit:int = 20, db:Session = Depends(get_db)):
    return crud.get_posts(db, skip, limit)

@app.get("/posts/{post_id}", response_model=PostResponse)
def read_post(post_id: int, db: Session = Depends(get_db)):
    post = crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@app.post("/posts/create-post", response_model=PostResponse)
def create_post(
    title: str = Form(...),
    description: str = Form(...),
    body: str = Form(...),
    category_id: int = Form(...),
    is_private: bool = Form(False),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    print('Hello From db', image)
    return crud.create_post(
        db=db,
        title=title,
        description=description,
        body=body,
        category_id=category_id,
        is_private=is_private,
        image=image
    )

@app.put("/posts/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    title: str = Form(None),
    description: str = Form(None),
    body: str = Form(None),
    category_id: int = Form(None),
    is_private: bool = Form(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    post_data = PostUpdate(
        title=title,
        description=description,
        body=body,
        category_id=category_id,
        is_private=is_private
    )
    return crud.update_post(db, post_id, post_data)

@app.delete("/posts/{post_id}", response_model=PostResponse)
def delete_post(post_id: int, db:Session = Depends(get_db)):
    deleted_post = crud.delete_post(db, post_id)
    if not deleted_post:
        raise HTTPException(status_code=404, detail="Post not found")
    return deleted_post

@app.get("/posts/{post_id}/image")
def get_post_image(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post or not post.image_data:
        raise HTTPException(status_code=404, detail="Image not found")
    return StreamingResponse(io.BytesIO(post.image_data), media_type="image/jpeg")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
