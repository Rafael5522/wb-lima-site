"""
Aplicação Flask para WB Lima - Backend
Segurança Eletrônica Premium
"""
import os
from flask import Flask, render_template, jsonify
from flask_cors import CORS
from flask_mailman import Mail
from datetime import datetime
from models import db, Lead
from config import config_map


def create_app(config_name=None):
    """Factory para criar a aplicação Flask"""
    
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
    
    app = Flask(__name__)
    app.config.from_object(config_map.get(config_name, config_map['default']))
    
    # Criar pasta instance se não existir
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # Inicializar extensões
    db.init_app(app)
    mail = Mail(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Salvar mail no app para acesso em outros módulos
    app.mail = mail
    
    # Registrar blueprints
    from routes.leads import leads_bp
    from routes.admin import admin_bp
    
    app.register_blueprint(leads_bp, url_prefix='/api/leads')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    
    # Rotas da aplicação
    @app.before_request
    def before_request():
        """Executado antes de cada request"""
        pass
    
    @app.route('/')
    def index():
        """Página inicial - Landing page"""
        return render_template('index.html')
    
    @app.route('/health')
    def health():
        """Health check para Render"""
        return jsonify({
            'status': 'ok',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    
    @app.route('/api/stats')
    def get_stats():
        """Retorna estatísticas da aplicação"""
        stats = Lead.get_stats()
        return jsonify(stats), 200
    
    # Tratamento de erros
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Recurso não encontrado'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Erro interno do servidor'}), 500
    
    # Context processor para variáveis globais
    @app.context_processor
    def inject_config():
        return dict(current_year=datetime.now().year)
    
    # Criar tabelas
    with app.app_context():
        db.create_all()
    
    return app


# Instância global da aplicação
app = create_app()
mail = app.mail


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=app.config['DEBUG']
    )
