import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Cria a tabela se não existir
(async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS cadastros (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        data TIMESTAMP NOT NULL
    )`);
})();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

async function emailValidoDeVerdade(email) {
    const key = process.env.EMAIL_API;
    const response = await fetch(`http://apilayer.net/api/check?access_key=${key}&email=${email}&smtp=1&format=1`);
    const data = await response.json();

    return data.smtp_check && !data.disposable;
}

app.post('/cadastro', async (req, res) => {
    const { nome, email } = req.body;
    if (!nome || !email) return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });

    const valido = await emailValidoDeVerdade(email);

    if (!valido) {
        return res.status(400).json({ erro: 'E-mail inválido ou temporário' });
    }
    try {
        const existe = await pool.query('SELECT 1 FROM cadastros WHERE LOWER(email) = LOWER($1)', [email]);
        if (existe.rowCount > 0) {
            return res.status(409).json({ error: 'E-mail já cadastrado.' });
        }
        await pool.query('INSERT INTO cadastros (nome, email, data) VALUES ($1, $2, NOW())', [nome, email]);
        res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao cadastrar.' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
