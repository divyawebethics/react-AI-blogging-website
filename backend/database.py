''' First step is to setup an engine object which is subsequently used to perform SQL operations. The functions has two arguments, one is the name of the 
database and other is the echo parameter which is when set to true will generate the activity log. If it doesn't exist, the database will be created. In the 
code the sql lite database will be created using the create_engine. The engine establishes the real DBAPI connection to the database when a method like 
Engine.execute() or Engine.connect() is called.
In case of ORM, the process starts by describing the database tables and then by definining the classes which will be mapped to those tables. In SQLAlchemy, 
these two tasks are performed together. This is done by using declarative_base; the classes created include directives to describe the actual database table 
they are mapped to. A base class stores a catalog of classes and mapped tables in the declarative system. The information about the class in declarative system,
is called table metadata. SQLAlchemy uses table object to represent this information for a specific table created by Declarative. Each Table object is a member of larger collection known as MetaData and this object 
is available using the .metadata attribute of declarative base class. The MetaData.create_all() method is, passing in our Engine as a source of database 
connectivity. For all tables that havent been created yet, it issues CREATE TABLE statements to the database.
In order to interact with the database, we need to obtain its handle. A session object is the handle to database. Session class is obtained using sessionmaker
a configurable session factory method which is bound to the engine object created earlier.
The session establishes all conversatins with the database. It starts by creating a session, when all the objects are persisted with this session, the session
keeps track of all the changes, now the session will process all the transactions at once, then commit to the database and rollback in case do not want to send
anything. Session will either send everything or nothing.
'''


from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "postgresql+pg8000://divya:Divya%402025@localhost:5432/users"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,echo=True)

'''
The declarative base class connects python classes to the database tables, provide metadata tracking, enables ORM features,
'''

SessionLocal = sessionmaker(autocommit = False, autoflush = False, bind =  engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


