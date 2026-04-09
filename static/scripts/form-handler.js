/**
 * Form Handler - WB Lima
 * Processamento básico do formulário de contato
 * O envio real é handled por formsubmit.co
 */

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    
    if (!form) return;

    form.addEventListener('submit', function(e) {
        // Validação básica antes de enviar
        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const phone = document.getElementById('form-phone').value.trim();
        const tipo = document.getElementById('form-tipo').value;
        const message = document.getElementById('form-message').value.trim();

        // Validações
        if (!name || name.length < 3) {
            e.preventDefault();
            alert('Nome deve ter pelo menos 3 caracteres');
            return false;
        }

        if (!email || !isValidEmail(email)) {
            e.preventDefault();
            alert('Email inválido');
            return false;
        }

        if (!phone || phone.length < 10) {
            e.preventDefault();
            alert('Telefone inválido');
            return false;
        }

        if (!tipo) {
            e.preventDefault();
            alert('Selecione um tipo de serviço');
            return false;
        }

        if (!message || message.length < 10) {
            e.preventDefault();
            alert('Mensagem deve ter pelo menos 10 caracteres');
            return false;
        }

        // Se passou em todas as validações, o formsubmit.co cuida do envio
        console.log('✓ Formulário validado e pronto para envio');
    });

    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
});
