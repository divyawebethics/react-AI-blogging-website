from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session as SQLAlchemySession, joinedload
from pydantic_models import CategoryCreate, CategoryUpdate, PostUpdate
from models import Category, Post


def create_category(db: SQLAlchemySession, category: CategoryCreate):
    db_category = Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return {"id": db_category.id, "name": db_category.name}

def get_categories(db: SQLAlchemySession):
    categories = db.query(Category).all()
    return [{"id": c.id, "name": c.name} for c in categories]

def get_category(db: SQLAlchemySession, category_id: int):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        return None
    return {"id": category.id, "name": category.name}

def update_category(db: SQLAlchemySession, category_id: int, category: CategoryUpdate):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        return None
    db_category.name = category.name
    db.commit()
    db.refresh(db_category)
    return {"id": db_category.id, "name": db_category.name}

def delete_category(db: SQLAlchemySession, category_id: int):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        return None
    db.delete(db_category)
    db.commit()
    return {"id": db_category.id, "name": db_category.name}

def get_posts(db: SQLAlchemySession, skip: int = 0, limit: int = 100):
    posts = db.query(Post).options(joinedload(Post.category)).all()
    return [
        {
            "id": post.id,
            "title": post.title,
            "description": post.description,
            "body": post.body,
            "category_id": post.category_id,
            "category": post.category.name if post.category else None,
            "is_private": post.is_private,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "image_url": f"http://localhost:8080/posts/{post.id}/image" if post.image_data else None
        }
        for post in posts
    ]


def get_post(db: SQLAlchemySession, post_id: int):
    post = db.query(Post).filter(Post.id == post_id).first()
    return {
        "id": post.id,
        "title": post.title,
        "description": post.description,
        "body": post.body,
        "image_url": f"http://localhost:8080/posts/{post.id}/image" if post.image_data else None,
        "category": post.category.name if post.category else None,
        "category_id": post.category_id,
        "is_private": post.is_private,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
    }

def create_post(
    db: SQLAlchemySession,
    title: str,
    description: str,
    body: str,
    category_id: int,
    is_private: bool = False,
    image: UploadFile | None = None,
):
    image_data = None
    image_filename = None
    ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

    if image and image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid image type")
    if image and image.filename:  # Check if image exists and has filename
        image_data =  image.read()  # Use await for async read
        image_filename = image.filename

    db_post = Post(
        title=title,
        description=description,
        body=body,
        category_id=category_id,
        is_private=is_private,
        image_data=image_data,
        image_filename=image_filename,
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    
    return {
        "id": db_post.id,
        "title": db_post.title,
        "description": db_post.description,
        "body": db_post.body,
        "image_url": f"http://localhost:8080/posts/{db_post.id}/image" if db_post.image_data else None,
        "category_id": db_post.category_id,
        "category": db_post.category.name if db_post.category else None,
        "is_private": db_post.is_private,
        "created_at": db_post.created_at,
        "updated_at": db_post.updated_at,
    }
def update_post(db: SQLAlchemySession, post_id: int, post: PostUpdate, image: UploadFile | None = None):
    db_post = db.query(Post).options(joinedload(Post.category)).filter(Post.id == post_id).first()
    if not db_post:
        return None
    
    for key, value in post.dict(exclude_unset=True).items():
        setattr(db_post, key, value)
    
    # Handle image update
    if image:
        image_data = image.file.read()
        db_post.image_data = image_data
        db_post.image_filename = image.filename
    
    db.commit()
    db.refresh(db_post)
    return {
        "id": db_post.id,
        "title": db_post.title,
        "description": db_post.description,
        "body": db_post.body,
        "image_filename": db_post.image_filename,
        "image_url": f"http://localhost:8080/posts/{db_post.id}/image" if db_post.image_data else None,
        "category_id": db_post.category_id,
        "category": db_post.category.name if db_post.category else None,
        "is_private": db_post.is_private,
        "created_at": db_post.created_at,
        "updated_at": db_post.updated_at,
    }
def delete_post(db: SQLAlchemySession, post_id: int):
    db_post = db.query(Post).options(joinedload(Post.category)).filter(Post.id == post_id).first()
    if not db_post:
        return None
    db.delete(db_post)
    db.commit()
    return {
        "id": db_post.id,
        "title": db_post.title,
        "description": db_post.description,
        "body": db_post.body,
        "image_filename": db_post.image_filename,
        "image_url": None,
        "category_id": db_post.category_id,
        "category": db_post.category.name if db_post.category else None,
        "is_private": db_post.is_private,
        "created_at": db_post.created_at,
        "updated_at": db_post.updated_at,
    }
