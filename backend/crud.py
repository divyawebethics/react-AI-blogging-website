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
    is_private: bool = False,
    image: UploadFile | None = None,
):
    image_url = None
    if image and image.filename:
        # Create secure filename and save
        file_location = os.path.join(UPLOAD_DIR, image.filename)
        with open(file_location, "wb+") as f:
            # Read file in chunks to handle large files
            contents = image.file.read()
            f.write(contents)
        image_url = f"/uploads/{image.filename}"

    db_post = models.Post(
        title=title,
        description=description,
        body=body,
        category_id=category_id,
        is_private=is_private,
        image_url=image_url,
    )

    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

def get_posts(db: Session):
    posts = db.query(models.Post).all()
    return posts

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