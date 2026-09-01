-- Cria o banco físico usado pela aplicação.
CREATE DATABASE IF NOT EXISTS prev_maintenance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE prev_maintenance_db;

-- 1. Cria a tabela de configurações globais.
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    system_name VARCHAR(100) DEFAULT 'Sistema de Gestão de Manutenção',
    company_name VARCHAR(100) DEFAULT 'Minha Empresa TI',
    default_interval_months INT DEFAULT 6,
    near_due_days INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Cria a tabela de usuários e seus papéis.
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY, -- Usaremos UUID
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'TECHNICIAN') DEFAULT 'TECHNICIAN',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Cria a tabela de empresas clientes.
CREATE TABLE companies (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20),
    contact_name VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Cria a tabela de computadores monitorados.
CREATE TABLE computers (
    id CHAR(36) PRIMARY KEY,
    unique_code VARCHAR(50) UNIQUE NOT NULL, -- Ex: PC-ABC-0001
    name VARCHAR(100) NOT NULL,
    company_id CHAR(36) NOT NULL,
    patrimony VARCHAR(50),
    serial_number VARCHAR(100),
    department VARCHAR(100),
    assigned_user VARCHAR(100),
    brand VARCHAR(50),
    model VARCHAR(100),
    processor VARCHAR(100),
    ram_memory VARCHAR(50),
    storage VARCHAR(100),
    operational_system VARCHAR(100),
    purchase_date DATE,
    custom_interval_months INT NULL, -- Se NULL, usa o global
    last_maintenance_date DATETIME NULL,
    next_maintenance_date DATETIME NULL,
    status ENUM('EM_DIA', 'PROXIMO_VENCIMENTO', 'ATRASADO', 'EM_MANUTENCAO', 'COM_PROBLEMA') DEFAULT 'EM_DIA',
    observations TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE RESTRICT
);

-- 5. Cria a tabela de histórico de manutenções.
CREATE TABLE maintenances (
    id CHAR(36) PRIMARY KEY,
    computer_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    status ENUM('AGENDADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA') DEFAULT 'CONCLUIDA',
    started_at DATETIME NOT NULL,
    completed_at DATETIME NULL,
    initial_observations TEXT,
    procedures_done TEXT,
    issues_found TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (computer_id) REFERENCES computers(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 6. Cria a tabela de avaliações técnicas.
CREATE TABLE technical_evaluations (
    id CHAR(36) PRIMARY KEY,
    computer_id CHAR(36) NOT NULL,
    maintenance_id CHAR(36) NULL, -- A qual manutenção esse problema se refere
    technician_id CHAR(36) NOT NULL,
    problem_description TEXT NOT NULL,
    occurrence_date DATETIME NOT NULL,
    priority ENUM('BAIXA', 'MEDIA', 'ALTA', 'URGENTE') DEFAULT 'MEDIA',
    status ENUM('AGUARDANDO_AVALIACAO', 'EM_ANALISE', 'DIAGNOSTICO_REALIZADO', 'AGUARDANDO_PECA', 'RESOLVIDO', 'ENCERRADO') DEFAULT 'AGUARDANDO_AVALIACAO',
    diagnostic TEXT,
    applied_solution TEXT,
    resolution_date DATETIME NULL,
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (computer_id) REFERENCES computers(id) ON DELETE CASCADE,
    FOREIGN KEY (maintenance_id) REFERENCES maintenances(id) ON DELETE SET NULL,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Insere a configuração inicial do sistema.
INSERT INTO system_settings (system_name, company_name, default_interval_months, near_due_days) 
VALUES ('PrevSystem', 'Tech Support LTDA', 6, 30);

-- Inserir Usuário Admin Padrão (Senha: admin123 -> Hash gerado pelo Bcrypt para 'admin123')
INSERT INTO users (id, name, email, password_hash, role) 
VALUES ('admin-uuid-0000-0000', 'Administrador', 'admin@admin.com', '$2b$10$iDFIgNP1ML5n7spqrSTpxuot7SDM2kPnwnEpikGFTekzjetNA0gp.', 'ADMIN');