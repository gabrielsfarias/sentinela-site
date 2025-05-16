import express from 'express';
import cors from 'cors';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// Serve frontend estático da pasta public (ajuste caminho conforme necessário)
app.use(express.static(path.join(__dirname, '../public')));

const FILE_PATH = join(__dirname, 'cadastros.json');

function lerCadastros() {
    if (!existsSync(FILE_PATH)) return [];
    try {
        return JSON.parse(readFileSync(FILE_PATH, 'utf-8'));
    } catch {
        return [];
    }
}

function salvarCadastros(cadastros) {
    writeFileSync(FILE_PATH, JSON.stringify(cadastros, null, 2));
}

app.post('/cadastro', (req, res) => {
    const { nome, email } = req.body;
    if (!nome || !email) return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });

    const cadastros = lerCadastros();

    if (cadastros.find(c => c.email.toLowerCase() === email.toLowerCase())) {
        return res.status(409).json({ error: 'E-mail já cadastrado.' });
    }

    cadastros.push({ nome, email, data: new Date().toISOString() });
    salvarCadastros(cadastros);

    res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
