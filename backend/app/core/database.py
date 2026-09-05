import os

from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import (
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_DATABASE,
)


# --------------------------------------------------
# Database configuration
# --------------------------------------------------

# If DATABASE_URL is provided, use it.
# Render will use SQLite.
# Otherwise, use the existing local MySQL configuration.
DATABASE_URL = os.getenv("DATABASE_URL")


if DATABASE_URL:
    database_url = DATABASE_URL

    # SQLite needs this setting when used with FastAPI
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False},
        )
    else:
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
        )

else:
    # Local development → MySQL
    database_url = URL.create(
        drivername="mysql+pymysql",
        username=MYSQL_USER,
        password=MYSQL_PASSWORD,
        host=MYSQL_HOST,
        port=int(MYSQL_PORT),
        database=MYSQL_DATABASE,
    )

    engine = create_engine(
        database_url,
        pool_pre_ping=True,
    )


# --------------------------------------------------
# Session
# --------------------------------------------------

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


# --------------------------------------------------
# Base model
# --------------------------------------------------

Base = declarative_base()


# --------------------------------------------------
# Database dependency
# --------------------------------------------------

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()