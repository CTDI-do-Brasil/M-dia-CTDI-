-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'dept', 'viewer')),
    password VARCHAR(100),
    department VARCHAR(100)
);

-- Criar tabela de itens de mídia
CREATE TABLE IF NOT EXISTS media_items (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('image', 'video')),
    url TEXT NOT NULL,
    size VARCHAR(50) NOT NULL,
    department VARCHAR(100) NOT NULL,
    uploaded_by VARCHAR(100) NOT NULL,
    uploaded_at VARCHAR(100) NOT NULL,
    duration INTEGER,
    schedule_start VARCHAR(100),
    schedule_end VARCHAR(100),
    order_index INTEGER DEFAULT 0
);

-- Inserir usuários padrão caso não existam
INSERT INTO users (id, email, username, name, role, password, department)
VALUES 
('user-admin', 'admin@ctdibrasil.com.br', 'admin', 'Administrador Master', 'admin', 'qwe!@#123', NULL),
('user-mkt', 'marketing@ctdibrasil.com.br', 'marketing', 'Depto Marketing', 'dept', '123', 'Marketing'),
('user-eng', 'engenharia@ctdibrasil.com.br', 'engenharia', 'Depto Engenharia', 'dept', '123', 'Engenharia'),
('user-viewer', 'visualizador@ctdibrasil.com.br', 'visualizador', 'Visualizador Geral', 'viewer', '123', NULL)
ON CONFLICT (email) DO NOTHING;
