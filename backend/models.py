## These are models that are going to build connectin between the tables and the python classes

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func, Text, Boolean, LargeBinary
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import relationship    

class Base(DeclarativeBase):
    pass

class my_users(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)  
    first_name = Column(String)
    last_name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    posts = relationship("Post", back_populates="category", cascade="all, delete-orphan", passive_deletes=True)

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    body = Column(Text, nullable=False)
    image_data = Column(LargeBinary, nullable=True)
    image_filename = Column(String(255), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    is_private = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    category = relationship("Category", back_populates="posts")