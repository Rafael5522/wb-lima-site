"""
Rotas de administração
"""
from flask import Blueprint, request, jsonify, session, render_template, current_app
from models import db, Lead
from datetime import datetime
from functools import wraps


admin_bp = Blueprint('admin', __name__)


def require_admin(f):
    """Decorator para verificar autenticação admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return jsonify({'error': 'Não autorizado'}), 401
        return f(*args, **kwargs)
    return decorated_function


@admin_bp.route('/login', methods=['POST'])
def login():
    """Faz login no painel admin"""
    try:
        data = request.get_json() or request.form.to_dict()
        password = data.get('password', '')
        
        # Verificar senha
        if password == current_app.config['ADMIN_PASSWORD']:
            session['admin_logged_in'] = True
            session.permanent = True
            return jsonify({
                'success': True,
                'message': 'Login realizado com sucesso'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Senha incorreta'
            }), 401
    
    except Exception as e:
        current_app.logger.error(f'Erro no login: {str(e)}')
        return jsonify({'error': 'Erro ao fazer login'}), 500


@admin_bp.route('/logout', methods=['POST'])
def logout():
    """Faz logout do painel admin"""
    session.clear()
    return jsonify({'success': True, 'message': 'Logout realizado'}), 200


@admin_bp.route('/dashboard', methods=['GET'])
@admin_bp.route('/', methods=['GET'])
def dashboard():
    """Painel de controle admin"""
    if not session.get('admin_logged_in'):
        return render_template('admin_login.html')
    return render_template('admin_dashboard.html')


@admin_bp.route('/api/leads', methods=['GET'])
@require_admin
def list_leads():
    """Lista todos os leads com paginação e filtros"""
    try:
        # Parâmetros de paginação
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Filtros
        service_type = request.args.get('service_type', '').strip()
        email_sent = request.args.get('email_sent', '').lower()
        search = request.args.get('search', '').strip()
        sort_by = request.args.get('sort_by', 'created_at')
        order = request.args.get('order', 'desc').lower()
        
        # Construir query
        query = Lead.query
        
        # Aplicar filtros
        if service_type:
            query = query.filter_by(service_type=service_type)
        
        if email_sent in ('true', 'false'):
            query = query.filter_by(email_sent=email_sent == 'true')
        
        if search:
            query = query.filter(
                db.or_(
                    Lead.name.ilike(f'%{search}%'),
                    Lead.email.ilike(f'%{search}%'),
                    Lead.phone.ilike(f'%{search}%')
                )
            )
        
        # Ordenação
        if hasattr(Lead, sort_by):
            order_column = getattr(Lead, sort_by)
            if order == 'asc':
                query = query.order_by(order_column.asc())
            else:
                query = query.order_by(order_column.desc())
        else:
            query = query.order_by(Lead.created_at.desc())
        
        # Paginação
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        leads_data = [lead.to_dict() for lead in paginated.items]
        
        return jsonify({
            'success': True,
            'data': leads_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': paginated.total,
                'pages': paginated.pages,
                'has_next': paginated.has_next,
                'has_prev': paginated.has_prev
            }
        }), 200
    
    except Exception as e:
        current_app.logger.error(f'Erro ao listar leads: {str(e)}')
        return jsonify({'error': 'Erro ao listar leads'}), 500


@admin_bp.route('/api/leads/<int:lead_id>', methods=['GET'])
@require_admin
def admin_get_lead(lead_id):
    """Obtém detalhes de um lead (admin)"""
    try:
        lead = Lead.query.get(lead_id)
        if not lead:
            return jsonify({'error': 'Lead não encontrado'}), 404
        
        return jsonify(lead.to_dict()), 200
    
    except Exception as e:
        current_app.logger.error(f'Erro ao obter lead: {str(e)}')
        return jsonify({'error': 'Erro ao obter lead'}), 500


@admin_bp.route('/api/leads/<int:lead_id>', methods=['DELETE'])
@require_admin
def delete_lead(lead_id):
    """Deleta um lead"""
    try:
        lead = Lead.query.get(lead_id)
        if not lead:
            return jsonify({'error': 'Lead não encontrado'}), 404
        
        db.session.delete(lead)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Lead deletado com sucesso'
        }), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao deletar lead: {str(e)}')
        return jsonify({'error': 'Erro ao deletar lead'}), 500


@admin_bp.route('/api/leads/<int:lead_id>/notes', methods=['PUT', 'PATCH'])
@require_admin
def update_lead_notes(lead_id):
    """Atualiza notas de um lead"""
    try:
        lead = Lead.query.get(lead_id)
        if not lead:
            return jsonify({'error': 'Lead não encontrado'}), 404
        
        data = request.get_json() or request.form.to_dict()
        notes = data.get('notes', '').strip()
        
        if len(notes) > 5000:
            return jsonify({'error': 'Notas muito longas'}), 400
        
        lead.notes = notes or None
        lead.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Notas atualizadas',
            'lead': lead.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao atualizar notas: {str(e)}')
        return jsonify({'error': 'Erro ao atualizar notas'}), 500


@admin_bp.route('/api/leads/<int:lead_id>/email-sent', methods=['PUT', 'PATCH'])
@require_admin
def update_email_sent(lead_id):
    """Marca se o email foi enviado"""
    try:
        lead = Lead.query.get(lead_id)
        if not lead:
            return jsonify({'error': 'Lead não encontrado'}), 404
        
        data = request.get_json() or request.form.to_dict()
        email_sent = data.get('email_sent', False)
        
        if isinstance(email_sent, str):
            email_sent = email_sent.lower() in ('true', '1', 'yes')
        
        lead.email_sent = bool(email_sent)
        lead.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Status atualizado',
            'lead': lead.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f'Erro ao atualizar status: {str(e)}')
        return jsonify({'error': 'Erro ao atualizar status'}), 500


@admin_bp.route('/api/stats', methods=['GET'])
@require_admin
def admin_stats():
    """Retorna estatísticas para o painel admin"""
    try:
        stats = Lead.get_stats()
        
        # Adicionar informações por tipo de serviço
        service_stats = db.session.query(
            Lead.service_type,
            db.func.count(Lead.id).label('count')
        ).group_by(Lead.service_type).all()
        
        stats['by_service'] = {
            service: count for service, count in service_stats
        }
        
        return jsonify(stats), 200
    
    except Exception as e:
        current_app.logger.error(f'Erro ao obter stats: {str(e)}')
        return jsonify({'error': 'Erro ao obter estatísticas'}), 500


@admin_bp.route('/api/export', methods=['GET'])
@require_admin
def export_leads():
    """Exporta leads em CSV (ou JSON)"""
    try:
        format_type = request.args.get('format', 'json').lower()
        
        leads = Lead.query.order_by(Lead.created_at.desc()).all()
        
        if format_type == 'csv':
            import csv
            from io import StringIO
            from flask import make_response
            
            output = StringIO()
            writer = csv.DictWriter(output, fieldnames=[
                'id', 'name', 'email', 'phone', 'service_type', 
                'message', 'created_at', 'email_sent'
            ])
            writer.writeheader()
            
            for lead in leads:
                writer.writerow({
                    'id': lead.id,
                    'name': lead.name,
                    'email': lead.email,
                    'phone': lead.phone,
                    'service_type': lead.service_type,
                    'message': lead.message or '',
                    'created_at': lead.created_at.isoformat(),
                    'email_sent': 'Sim' if lead.email_sent else 'Não'
                })
            
            response = make_response(output.getvalue())
            response.headers['Content-Disposition'] = 'attachment; filename=leads.csv'
            response.headers['Content-Type'] = 'text/csv'
            return response
        
        else:  # JSON
            leads_data = [lead.to_dict() for lead in leads]
            return jsonify(leads_data), 200
    
    except Exception as e:
        current_app.logger.error(f'Erro ao exportar: {str(e)}')
        return jsonify({'error': 'Erro ao exportar dados'}), 500
