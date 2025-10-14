## These are pydantic models to validate the fields and ensure that user fill the correct information 
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

class TokenData(BaseModel):
    name: str | None = None

class UserOutBase(BaseModel):
    first_name: str
    last_name: str
    email: str

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

    model_config = ConfigDict(from_attributes=True) 