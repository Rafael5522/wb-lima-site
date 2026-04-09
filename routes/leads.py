"""
Rotas para gerenciamento de leads
"""
from flask import Blueprint, request, jsonify, current_app
from models import db, Lead
from datetime import datetime
from functools import wraps
import re


leads_bp = Blueprint('leads', __name__)


def validate_lead_data(data):
    """Valida os dados do formulário"""
    errors = []
    
    # Validar nome
    name = data.get('name', '').strip()
    if not name or len(name) < 3:
        errors.append('Nome deve ter pelo menos 3 caracteres')
    if len(name) > 120:
        errors.append('Nome muito longo (máximo 120 caracteres)')
    
    # Validar email
    email = data.get('email', '').strip().lower()
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        errors.append('Email inválido')
    
    # Validar telefone
    phone = data.get('phone', '').strip()
    phone_clean = re.sub(r'\D', '', phone)
    if len(phone_clean) < 10:
        errors.append('Telefone deve ter pelo menos 10 dígitos')
    if len(phone) > 20:
        errors.append('Telefone muito longo')
    
    # Validar tipo de serviço
    service_type = data.get('tipo') or data.get('service_type', '').strip()
    valid_services = ['cerca', 'cftv', 'acesso', 'infraestrutura', 'automacao', 'consultoria', 'outro']
    if not service_type or service_type.lower() not in valid_services:
        errors.append('Tipo de serviço inválido')
    
    # Validar mensagem
    message = data.get('message', '').strip()
    if message and len(message) > 5000:
        errors.append('Mensagem muito longa (máximo 5000 caracteres)')
    
    if errors:
        return None, errors
    
    return {
        'name': name,
        'email': email,
        'phone': phone,
        'service_type': service_type.lower(),
        'message': message or None
    }, []


def send_lead_email(lead):
    """Envia email para o novo lead"""
    try:
        if not current_app.config['MAIL_USERNAME']:
            current_app.logger.warning('Email não configurado - pulando envio')
            return False

        # Email para o cliente
        customer_subject = 'Recebemos sua solicitação - WB Lima Segurança'
        customer_body = f'''
Olá {lead.name},

Obrigado por entrar em contato com a WB Lima!

Recebemos sua solicitação de {lead.service_type.replace('_', ' ')} e responderemos em breve.

Dados do contato:
- Nome: {lead.name}
- Email: {lead.email}
- Telefone: {lead.phone}

Para contato urgente, ligue: (11) 94777-2127

Atenciosamente,
WB Lima Segurança Eletrônica
'''
        customer_html = f'''
<html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Olá {lead.name},</h2>
            <p>Obrigado por entrar em contato com a <strong>WB Lima</strong>!</p>
            <p>Recebemos sua solicitação de <strong>{lead.service_type.replace('_', ' ')}</strong> e responderemos em breve.</p>
            
            <h3>Seus dados de contato:</h3>
            <ul>
                <li><strong>Nome:</strong> {lead.name}</li>
                <li><strong>Email:</strong> {lead.email}</li>
                <li><strong>Telefone:</strong> {lead.phone}</li>
            </ul>
            
            <p><strong>Para contato urgente:</strong> <a href="tel:+5511947772127">(11) 94777-2127</a></p>
            
            <hr>
            <p><em>WB Lima Segurança Eletrônica | Proteção Premium para seu Patrimônio</em></p>
        </div>
    </body>
</html>
'''

        # Email para a empresa
        admin_subject = f'Novo Lead: {lead.name} - {lead.service_type}'
        admin_body = f'''
Novo lead recebido!

Nome: {lead.name}
Email: {lead.email}
Telefone: {lead.phone}
Serviço: {lead.service_type}
IP: {lead.ip_address}
Data: {lead.created_at.strftime('%d/%m/%Y %H:%M:%S')}

Mensagem:
{lead.message or '(sem mensagem)'}

Responda em: https://wblima.com.br/admin
'''
        admin_html = f'''
<html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <h2 style="color: #00a86b;">Novo Lead Recebido! 🎯</h2>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p><strong>Nome:</strong> {lead.name}</p>
                <p><strong>Email:</strong> <a href="mailto:{lead.email}">{lead.email}</a></p>
                <p><strong>Telefone:</strong> <a href="tel:{lead.phone}">{lead.phone}</a></p>
                <p><strong>Serviço:</strong> <strong>{lead.service_type}</strong></p>
                <p><strong>Data:</strong> {lead.created_at.strftime('%d/%m/%Y às %H:%M:%S')}</p>
                <p><strong>IP:</strong> {lead.ip_address}</p>
            </div>
            
            <h3>Mensagem do Cliente:</h3>
            <div style="background-color: white; padding: 15px; border-left: 4px solid #00a86b;">
                <p>{lead.message or '<em>(sem mensagem adicional)</em>'}</p>
            </div>
            
            <a href="https://wblima.com.br/admin" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #00a86b; color: white; text-decoration: none; border-radius: 4px;">Ver no Painel Admin</a>
        </div>
    </body>
</html>
'''
        
        current_app.mail.send_mail(
            subject=customer_subject,
            message=customer_body,
            from_email=current_app.config['MAIL_DEFAULT_SENDER'],
            recipient_list=[lead.email],
            html_message=customer_html,
            fail_silently=False
        )

        current_app.mail.send_mail(
            subject=admin_subject,
            message=admin_body,
            from_email=current_app.config['MAIL_DEFAULT_SENDER'],
            recipient_list=[current_app.config['MAIL_DEFAULT_SENDER']],
            html_message=admin_html,
            fail_silently=False
        )

        return True
    
    except Exception as e:
        current_app.logger.error(f'Erro ao enviar email: {str(e)}')
        return False


@leads_bp.route('', methods=['POST'])
def create_lead():
    """Cria um novo lead"""
    try:
        data = request.get_json() or request.form.to_dict()
        
        # Validar dados
        validated_data, errors = validate_lead_data(data)
        if errors:
            return jsonify({
                'success': False,
                'message': 'Dados inválidos',
                'errors': errors
            }), 400
        
        # Verificar se o email já existe (evitar duplicatas no mesmo dia)
        from datetime import timedelta
        today = datetime.utcnow().date()
        existing = Lead.query.filter(
            Lead.email == validated_data['email'],
            db.func.date(Lead.created_at) == today
        ).first()
        
        if existing:
            return jsonify({
                'success': False,
                'message': 'Já existe um lead para este email hoje. Aguarde nosso contato!'
            }), 409
        
        # Criar novo lead
        new_lead = Lead(
            name=validated_data['name'],
            email=validated_data['email'],
            phone=validated_data['phone'],
            service_type=validated_data['service_type'],
            message=validated_data['message'],
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', '')[:255]
        )
        
        db.session.add(new_lead)
        db.session.commit()
        
        # Tentar enviar email (não falha a requisição se falhar)
        email_sent = send_lead_email(new_lead)
        new_lead.email_sent = email_sent
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Lead registrado com sucesso! Entraremos em contato em breve.',
            'lead_id': new_lead.id,
            'email_sent': email_sent
        }), 201
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao criar lead: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Erro ao processar sua solicitação'
        }), 500


@leads_bp.route('/<int:lead_id>', methods=['GET'])
def get_lead(lead_id):
    """Obtém um lead específico (público apenas com ID)"""
    try:
        lead = Lead.query.get(lead_id)
        if not lead:
            return jsonify({'error': 'Lead não encontrado'}), 404
        
        return jsonify(lead.to_dict()), 200
    
    except Exception as e:
        current_app.logger.error(f'Erro ao obter lead: {str(e)}')
        return jsonify({'error': 'Erro ao obter lead'}), 500


# Rota para listar todos os leads está em routes/admin.py com autenticação

@leads_bp.route('/health', methods=['GET'])
def health():
    """Health check específico para leads"""
    return jsonify({'status': 'ok', 'service': 'leads'}), 200
