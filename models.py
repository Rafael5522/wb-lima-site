"""
Modelos de banco de dados
"""
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()


class Lead(db.Model):
    """Modelo para armazenar leads do formulário"""
    __tablename__ = 'leads'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False, index=True)
    email = db.Column(db.String(120), nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    email_sent = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text, nullable=True)
    
    def __repr__(self):
        return f'<Lead {self.id} - {self.name}>'
    
    def to_dict(self):
        """Converte o objeto para dicionário"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'service_type': self.service_type,
            'message': self.message,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'email_sent': self.email_sent,
            'notes': self.notes
        }
    
    def to_json(self):
        """Retorna a representação JSON"""
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=2)
    
    @staticmethod
    def get_stats():
        """Retorna estatísticas dos leads"""
        total = Lead.query.count()
        today = datetime.utcnow().date()
        today_leads = Lead.query.filter(
            db.func.date(Lead.created_at) == today
        ).count()
        email_sent = Lead.query.filter_by(email_sent=True).count()
        
        return {
            'total': total,
            'today': today_leads,
            'email_sent': email_sent,
            'pending': total - email_sent
        }
