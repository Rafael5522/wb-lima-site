/**
 * Form Handler - WB Lima
 * Processa o envio do formulário de contato via API
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusDiv = document.getElementById('form-status');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Limpar mensagens anteriores
        statusDiv.innerHTML = '';
        clearErrors();

        // Coletar dados
        const formData = {
            name: document.getElementById('form-name').value.trim(),
            email: document.getElementById('form-email').value.trim(),
            phone: document.getElementById('form-phone').value.trim(),
            tipo: document.getElementById('form-tipo').value,
            message: document.getElementById('form-message').value.trim()
        };

        // Desabilitar botão
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Sucesso
                showSuccess(data.message);
                form.reset();
                
                // Auto-scroll para mensagem de sucesso
                setTimeout(() => {
                    statusDiv.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            } else {
                // Erro com detalhes
                if (data.errors && Array.isArray(data.errors)) {
                    data.errors.forEach(error => {
                        displayError(error);
                    });
                } else if (data.message) {
                    showError(data.message);
                } else {
                    showError('Ocorreu um erro ao processar sua solicitação');
                }
            }
        } catch (error) {
            console.error('Erro:', error);
            showError('Erro na conexão. Tente novamente mais tarde.');
        } finally {
            // Reabilitar botão
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-send"></i> Enviar Mensagem';
        }
    });

    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        document.querySelectorAll('.form-group').forEach(el => {
            el.classList.remove('is-invalid');
        });
    }

    function displayError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-item';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        statusDiv.appendChild(errorDiv);
    }

    function showError(message) {
        statusDiv.innerHTML = `
            <div class="alert alert-error">
                <i class="fas fa-times-circle"></i>
                <span>${message}</span>
            </div>
        `;
        statusDiv.classList.add('show');
    }

    function showSuccess(message) {
        statusDiv.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
            </div>
        `;
        statusDiv.classList.add('show');
    }
});
