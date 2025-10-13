from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from pydantic_models import PostCreate, PostUpdate, PostResponse
import crud

app = FastAPI()

@app.get("/posts/", response_model=list[PostResponse])
def read_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_posts(db, skip, limit)

@app.get("/posts/{post_id}", response_model=PostResponse)
def read_post(post_id: int, db: Session = Depends(get_db)):
    post = crud.get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@app.post("/posts/", response_model=PostResponse)
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    return crud.create_post(db, post)

@app.put("/posts/{post_id}", response_model=PostResponse)
def update_post(post_id: int, post_update: PostUpdate, db: Session = Depends(get_db)):
    updated_post = crud.update_post(db, post_id, post_update)
    if not updated_post:
        raise HTTPException(status_code=404, detail="Post not found")
    return updated_post

@app.delete("/posts/{post_id}", response_model=PostResponse)
def delete_post(post_id: int, db: Session = Depends(get_db)):
    deleted_post = crud.delete_post(db, post_id)
    if not deleted_post:
        raise HTTPException(status_code=404, detail="Post not found")
    return deleted_post
