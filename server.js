import express from 'express';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import os from 'os';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do PostgreSQL Pool
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';
const pool = new Pool({
  connectionString,
});

app.use(express.json());

// Servir arquivos estáticos do build do Vite (dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Inicialização das tabelas a partir do schema.sql
const initializeDatabase = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSql);
      console.log('Banco de dados PostgreSQL inicializado com sucesso.');
    } else {
      console.warn('schema.sql não encontrado. Certifique-se de inicializar o banco manualmente.');
    }
  } catch (err) {
    console.error('Erro ao inicializar o banco de dados:', err);
  }
};

initializeDatabase();

// --- API ROUTES ---

// 1. Auth Login
app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identificador e senha são obrigatórios.' });
  }

  try {
    const query = `
      SELECT * FROM users 
      WHERE (LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1))
      LIMIT 1
    `;
    const result = await pool.query(query, [identifier.trim()]);
    const user = result.rows[0];

    if (user && user.password === password) {
      // Remover campo de senha do payload de retorno
      const { password, ...userWithoutPassword } = user;
      return res.json(userWithoutPassword);
    }
    return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// 2. List Users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
});

// 3. Create User
app.post('/api/users', async (req, res) => {
  const { name, email, role, department, password } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Nome, E-mail e Cargo são obrigatórios.' });
  }

  const id = `user-${Date.now()}`;
  const username = email.split('@')[0];

  try {
    const checkExists = await pool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (checkExists.rows.length > 0) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }

    const query = `
      INSERT INTO users (id, name, email, username, role, department, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [id, name, email, username, role, department || null, password || null]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  }
});

// 4. Update User
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role, department, password } = req.body;

  try {
    const username = email.split('@')[0];
    const query = `
      UPDATE users
      SET name = $1, email = $2, username = $3, role = $4, department = $5, password = $6
      WHERE id = $7
      RETURNING *
    `;
    const result = await pool.query(query, [name, email, username, role, department || null, password || null, id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
});

// 5. Delete User
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
});

// 6. List Media Items
app.get('/api/media', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM media_items ORDER BY order_index ASC, uploaded_at DESC');
    // Mapeia nomes de colunas do banco (snake_case) para CamelCase no retorno da API
    const mapped = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      type: row.type,
      url: row.url,
      size: row.size,
      department: row.department,
      uploadedBy: row.uploaded_by,
      uploadedAt: row.uploaded_at,
      duration: row.duration,
      scheduleStart: row.schedule_start,
      scheduleEnd: row.schedule_end,
      orderIndex: row.order_index
    }));
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar mídias.' });
  }
});

// 7. Create Media Item
app.post('/api/media', async (req, res) => {
  const { title, type, url, size, department, duration, scheduleStart, scheduleEnd, uploadedBy } = req.body;
  if (!title || !type || !url || !size || !department) {
    return res.status(400).json({ error: 'Campos de mídia incompletos.' });
  }

  const id = `media-${Date.now()}`;
  const uploadedAt = new Date().toISOString();

  try {
    // Obter o maior order_index para colocar no final
    const maxIdxResult = await pool.query('SELECT MAX(order_index) as max_idx FROM media_items');
    const orderIndex = (maxIdxResult.rows[0].max_idx || 0) + 1;

    const query = `
      INSERT INTO media_items (id, title, type, url, size, department, uploaded_by, uploaded_at, duration, schedule_start, schedule_end, order_index)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const result = await pool.query(query, [
      id, title, type, url, size, department, uploadedBy || 'Sistema', uploadedAt, 
      duration || null, scheduleStart || null, scheduleEnd || null, orderIndex
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao cadastrar mídia.' });
  }
});

// 8. Delete Media Item
app.delete('/api/media/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM media_items WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mídia não encontrada.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar mídia.' });
  }
});

// 9. Reorder Media Items
app.post('/api/media/reorder', async (req, res) => {
  const { mediaIds } = req.body; // Array de IDs ordenados
  if (!Array.isArray(mediaIds)) {
    return res.status(400).json({ error: 'Parâmetro inválido. Deve ser um array de IDs.' });
  }

  try {
    const promises = mediaIds.map((id, index) => {
      return pool.query('UPDATE media_items SET order_index = $1 WHERE id = $2', [index, id]);
    });
    await Promise.all(promises);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao reordenar playlist.' });
  }
});

// Qualquer outra requisição que não seja da API carrega a aplicação Single Page (dist/index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend executando na porta ${PORT}`);
  console.log('Disponível na rede local em:');
  console.log(`  - Local: http://localhost:${PORT}`);
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`  - Rede:  http://${net.address}:${PORT}`);
      }
    }
  }
});
