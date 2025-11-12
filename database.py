import sqlite3
from werkzeug.security import generate_password_hash 
import os

if os.path.exists('petshop.db'):
    os.remove('petshop.db')
    print("Banco de dados antigo removido.")

conn = sqlite3.connect('petshop.db')
cursor = conn.cursor()

# 1. Tabela de Usuários (com 'is_admin')
cursor.execute('''
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0 
)
''')
print("Tabela 'usuarios' criada.")

# 2. Tabela de Pets (AGORA COM 'nascimento')
cursor.execute('''
CREATE TABLE IF NOT EXISTS pets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    especie TEXT NOT NULL,
    raca TEXT,
    nascimento TEXT, 
    dono_id INTEGER NOT NULL,
    FOREIGN KEY (dono_id) REFERENCES usuarios (id)
)
''')
print("Tabela 'pets' criada com coluna 'nascimento'.")

# 3. Tabela de Agendamentos
cursor.execute('''
CREATE TABLE IF NOT EXISTS agendamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    pet_id INTEGER NOT NULL,
    servico TEXT NOT NULL,
    data TEXT NOT NULL,
    hora TEXT NOT NULL,
    telefone TEXT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
    FOREIGN KEY (pet_id) REFERENCES pets (id),
    UNIQUE(data, hora)
)
''')
print("Tabela 'agendamentos' criada.")

# ... (criação dos usuários admin e cliente) ...
# --- CRIANDO O USUÁRIO ADMIN ---
senha_admin_hash = generate_password_hash('admin123', method='pbkdf2:sha256')
try:
    cursor.execute("INSERT INTO usuarios (nome, email, senha_hash, is_admin) VALUES (?, ?, ?, ?)", 
                   ('Dono da Loja (Admin)', 'admin@petshop.com', senha_admin_hash, 1))
    conn.commit()
    print("Usuário ADMIN (admin@petshop.com / senha: admin123) criado.")
except sqlite3.IntegrityError:
    print("Usuário de teste admin já existe.")

# --- CRIANDO O USUÁRIO CLIENTE ---
senha_cliente_hash = generate_password_hash('cliente123', method='pbkdf2:sha256')
try:
    cursor.execute("INSERT INTO usuarios (nome, email, senha_hash, is_admin) VALUES (?, ?, ?, ?)", 
                   ('Cliente Comum', 'cliente@email.com', senha_cliente_hash, 0))
    conn.commit()
    print("Usuário CLIENTE (cliente@email.com / senha: cliente123) criado.")
except sqlite3.IntegrityError:
    print("Usuário de teste cliente já existe.")


conn.close()
print("\nBanco de dados criado e populado com sucesso.")