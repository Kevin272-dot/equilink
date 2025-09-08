from uuid import uuid4
from datetime import datetime
from extensions import db


class Report(db.Model):
    __tablename__ = 'reports'
    id = db.Column(db.String(36), primary_key=True,
                   default=lambda: str(uuid4()))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(255), nullable=True)
    language = db.Column(db.String(8), nullable=False)
    status = db.Column(db.String(20), default="pending")
    finalized = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text, nullable=True)
