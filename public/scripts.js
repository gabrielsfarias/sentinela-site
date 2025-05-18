document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formCadastro');

    // Criar elemento de mensagem
    const msgBox = document.createElement('div');
    msgBox.id = 'mensagem';
    msgBox.classList.add('mensagem');
    msgBox.style.display = 'none'; // começa oculto
    form.after(msgBox);

    let timeoutMsg;

    function mostrarMensagem(texto, tipo = 'sucesso') {
        msgBox.textContent = texto;
        msgBox.classList.remove('erro', 'sucesso');
        msgBox.classList.add(tipo);
        msgBox.style.display = 'block';

        // Limpar timeout anterior se houver
        if (timeoutMsg) clearTimeout(timeoutMsg);

        timeoutMsg = setTimeout(() => {
            msgBox.style.display = 'none';
            msgBox.textContent = '';
            msgBox.classList.remove('erro', 'sucesso');
        }, 3000);
    }


    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();

        try {
            const res = await fetch('/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email })
            });

            const data = await res.json();

            if (!res.ok) {
                mostrarMensagem(data.erro || 'Erro ao cadastrar. Verifique os dados.', 'erro');
                return;
            }

            mostrarMensagem('Cadastro realizado com sucesso!', 'sucesso');
            form.reset();
        } catch (err) {
            mostrarMensagem('Erro ao conectar com o servidor. Tente novamente mais tarde.', 'erro');
            console.error(err);
        }
    });
});
