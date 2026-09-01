-- Insere os valores iniciais de configuração.
INSERT INTO system_settings (system_name, company_name, default_interval_months, near_due_days, updated_at) 
VALUES ('PrevSystem', 'Tech Support LTDA', 6, 30, NOW());

-- Insere o administrador inicial usando um hash bcrypt.
INSERT INTO users (id, name, email, password_hash, role, updated_at) 
VALUES ('admin-uuid-0000-0000', 'Administrador', 'admin@admin.com', '$2b$10$iDFIgNP1ML5n7spqrSTpxuot7SDM2kPnwnEpikGFTekzjetNA0gp.', 'ADMIN', NOW());