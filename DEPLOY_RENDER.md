# 🚀 GUIA RÁPIDO DE DEPLOY NO RENDER

## Pré-requisitos
1. ✅ Código no GitHub
2. ✅ Conta no Render (render.com)
3. ✅ Variáveis de ambiente preparadas

## Passo 1: Prepare o Repositório GitHub

```bash
# Certifique-se de que tudo está commitado
git add .
git commit -m "Pronto para deploy"
git push origin main
```

## Passo 2: Crie o Web Service no Render

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Selecione seu repositório `wb-lima-site`
4. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `wb-lima-api` |
| **Environment** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app` |
| **Plan** | `Free` (ou Superior) |

## Passo 3: Configure Variáveis de Ambiente

Na aba **"Environment"**, adicione:

```
FLASK_ENV=production
SECRET_KEY=gera-uma-chave-super-segura-aqui-aleatorio
ADMIN_PASSWORD=sua-senha-admin-super-segura
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=seu-email@gmail.com
MAIL_PASSWORD=sua-senha-de-app-do-gmail
MAIL_DEFAULT_SENDER=contato@wblima.com.br
```

### Como gerar SECRET_KEY segura:
```python
python -c "import secrets; print(secrets.token_hex(32))"
```

## Passo 4: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde 2-3 minutos (build + deploy)
3. Acesse sua app em: `https://seu-app.onrender.com`

## Passo 5: Teste a Aplicação

- Landing page: `https://seu-app.onrender.com/`
- Admin login: `https://seu-app.onrender.com/admin`
- API docs: `https://seu-app.onrender.com/api/stats`

## 📧 Configurar Email (Gmail)

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione `Mail` e `Windows Computer`
3. Copy a senha de 16 caracteres
4. Use como `MAIL_PASSWORD` no Render

## 🔄 Atualizar o Deploy

Após fazer mudanças:

```bash
git add .
git commit -m "Nova atualização"
git push origin main
```

O Render fará redeploy automático (2-3 minutos).

## ⚠️ Limitações do Plano Free

- ⏱️ Aplicação dorme após 15 min de inatividade
- 📊 100 GB / mês de bandwidth
- 🗄️ Banco de dados básico (SQLite)

**Para produção de verdade:**
- Upgrade para plano pago
- Use PostgreSQL (suportado pelo Render)
- Configure domínio customizado

## 🆘 Troubleshooting

### App não inicia?
```bash
# Verifique os logs
# Dashboard → Seu App → Logs

# Comandos de teste locais
python app.py  # Teste local
pip install -r requirements.txt  # Reinstale deps
```

### Erro 502 Bad Gateway?
- Aguarde rebuild (pode levar 5 min)
- Verifique se `FLASK_ENV=production` está setado
- Verifique logs para erros de sintaxe Python

### Email não funciona?
- Verificar credenciais SMTP
- Usar "Senha de App" do Gmail
- Testar manualmente:
```python
from flask_mailman import Message
from app import app, mail

with app.app_context():
    msg = Message("Teste", recipients=["seu-email@gmail.com"])
    mail.send(msg)
```

### Banco de dados corrompido?
- Delete `instance/app.db` localmente
- Faça push (reconstrói)
- Render criará novo banco automaticamente

## 📱 Integrar com Frontend

Mude o endpoint do formulário de:
```javascript
// De:
fetch('/api/leads', ...)

// Para:
fetch('https://seu-app.onrender.com/api/leads', ...)
```

## 🔐 Segurança

- ✅ Altere `ADMIN_PASSWORD` (não use padrão)
- ✅ Use `SECRET_KEY` aleatória (não "senha123")
- ✅ HTTPS automático (Render provides)
- ✅ Variáveis de ambiente nunca visiveis publicamente

## 📊 Monitoramento

Acesse seu dashboard no Render para:
- 📈 Métricas de CPU/Memória
- 📊 Requisições HTTP
- 📝 Logs em tempo real
- ⚠️ Alertas de erro

## 💰 Saiba o Custo

- **Free:** Grátis, mas dorme
- **Paid:** $7 / mês (recomendado para produção)
- **Banco PostgreSQL:** $7 / mês (recomendado)

---

**Sucesso no deploy! 🎉**

Dúvidas? Entre em contato:
- Email: wellington@wblima.com.br
- WhatsApp: (11) 94777-2127
