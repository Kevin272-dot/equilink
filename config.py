from os import path, environ
from dotenv import load_dotenv

# Load variables from .env file
basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, '.env'))


class Config:
    # Secret key for session signing, fallback if not set in .env
    SECRET_KEY = environ.get('SECRET_KEY', 'you-will-never-guess')
    # Database URI, e.g., postgresql://user:pass@localhost/db or fallback to local sqlite
    SQLALCHEMY_DATABASE_URI = environ.get('DATABASE_URI') or \
        'sqlite:///' + path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
