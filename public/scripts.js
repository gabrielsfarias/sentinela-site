document.getElementById('formCadastro').addEventListener('submit', async function (event) {
    event.preventDefault();

    const nome = this.nome.value.trim();
    const email = this.email.value.trim();

    if (!nome || !email) {
        alert('Por favor, preencha nome e e-mail.');
        return;
    }

    try {
        const response = await fetch('/cadastro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Erro ao cadastrar.');
            return;
        }

        alert(data.message || 'Cadastro realizado com sucesso!');
        this.reset();

    } catch (error) {
        alert('Erro na comunicação com o servidor.');
        console.error(error);
    }
});