/**
 * Form Handler - WB Lima
 * Envia o formulário diretamente para a API /api/leads
 */

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitBtn = document.getElementById('contact-submit-btn');
    const feedback = document.getElementById('form-feedback');
    const originalButtonHtml = submitBtn ? submitBtn.innerHTML : '';

    function setFeedback(type, message) {
        if (!feedback) return;
        feedback.classList.remove('is-success', 'is-error', 'is-warning');
        if (type) feedback.classList.add(type);
        feedback.textContent = message || '';
    }

    function setLoading(isLoading) {
        if (!submitBtn) return;
        submitBtn.disabled = isLoading;
        submitBtn.setAttribute('aria-busy', String(isLoading));
        submitBtn.innerHTML = isLoading
            ? '<i class="fas fa-spinner fa-spin"></i> Enviando...'
            : originalButtonHtml;
    }

    function validatePayload(payload) {
        const errors = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneDigits = payload.phone.replace(/\D/g, '');

        if (!payload.name || payload.name.length < 3) {
            errors.push('Nome deve ter pelo menos 3 caracteres.');
        }
        if (!emailRegex.test(payload.email)) {
            errors.push('Email inválido.');
        }
        if (phoneDigits.length < 10) {
            errors.push('Telefone deve ter pelo menos 10 dígitos.');
        }
        if (!payload.tipo) {
            errors.push('Selecione um tipo de serviço.');
        }
        if (!payload.message || payload.message.length < 10) {
            errors.push('Mensagem deve ter pelo menos 10 caracteres.');
        }

        return errors;
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();
        setFeedback('', '');

        const payload = {
            name: (document.getElementById('form-name')?.value || '').trim(),
            email: (document.getElementById('form-email')?.value || '').trim(),
            phone: (document.getElementById('form-phone')?.value || '').trim(),
            tipo: (document.getElementById('form-tipo')?.value || '').trim(),
            message: (document.getElementById('form-message')?.value || '').trim()
        };

        const validationErrors = validatePayload(payload);
        if (validationErrors.length > 0) {
            setFeedback('is-error', validationErrors[0]);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(form.action || '/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(function () {
                return {};
            });

            if (response.ok && result.success) {
                setFeedback('is-success', result.message || 'Mensagem enviada com sucesso.');
                form.reset();
                form.querySelectorAll('.form-group.error').forEach(function (group) {
                    group.classList.remove('error');
                });
                form.querySelectorAll('.error-message').forEach(function (errorEl) {
                    errorEl.classList.remove('show');
                    errorEl.textContent = '';
                });
                return;
            }

            if (response.status === 409) {
                setFeedback('is-warning', result.message || 'Já recebemos seu contato hoje e retornaremos em breve.');
                return;
            }

            if (Array.isArray(result.errors) && result.errors.length > 0) {
                setFeedback('is-error', result.errors[0]);
                return;
            }

            setFeedback('is-error', result.message || result.error || 'Não foi possível enviar sua mensagem agora.');
        } catch (error) {
            setFeedback('is-error', 'Falha de conexão. Tente novamente em instantes.');
        } finally {
            setLoading(false);
        }
    });
});
