import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
# Importa ferramentas de senha e token
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager, get_jwt

app = Flask(__name__)

# --- CONFIGURAÇÃO CORRETA (CORS PRIMEIRO) ---
CORS(app, 
     resources={r"/api/*": {"origins": "*"}}, # Permite todas origens para rotas /api/
     supports_credentials=True,              # Permite envio de cookies/tokens
     allow_headers=["Authorization", "Content-Type"] # Permite os headers que usamos
)

# --- Configuração do Banco de Dados ---
DATABASE_NAME = 'petshop.db'

def get_db_conn():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn

# --- Configuração do JWT (Login) ---
app.config['JWT_SECRET_KEY'] = 'minha-chave-secreta-super-forte' 
# O JWT é inicializado DEPOIS do CORS (e apenas UMA VEZ)
jwt = JWTManager(app)


# ===============================================
# --- NOVO FILTRO GLOBAL (A SOLUÇÃO) ---
# ===============================================
@app.before_request
def handle_preflight_requests():
    """
    Este "hook" roda ANTES de CADA pedido.
    Ele captura o pedido 'OPTIONS' (preflight) e responde
    um "OK" vazio. A extensão CORS (que já inicializamos)
    vai então adicionar os cabeçalhos corretos a esta
    resposta "OK", permitindo que o navegador prossiga.
    """
    if request.method == 'OPTIONS':
        return jsonify({'message': 'Preflight request handled'}), 200

# ===============================================
# --- API de Autenticação ---
# ===============================================
@app.route('/api/registrar', methods=['POST'])
def registrar_usuario():
    dados = request.get_json()
    nome = dados.get('nome')
    email = dados.get('email')
    senha = dados.get('senha')

    if not all([nome, email, senha]):
        return jsonify({'sucesso': False, 'mensagem': 'Todos os campos são obrigatórios.'}), 400

    senha_hash = generate_password_hash(senha, method='pbkdf2:sha256')

    conn = None
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Novos usuários são sempre 'is_admin = 0' (clientes normais)
        cursor.execute(
            "INSERT INTO usuarios (nome, email, senha_hash, is_admin) VALUES (?, ?, ?, ?)",
            (nome, email, senha_hash, 0)
        )
        conn.commit()
        return jsonify({'sucesso': True, 'mensagem': 'Usuário cadastrado com sucesso!'}), 201

    except sqlite3.IntegrityError:
        return jsonify({'sucesso': False, 'mensagem': 'Este e-mail já está em uso.'}), 409
    except sqlite3.Error as e:
        return jsonify({'sucesso': False, 'mensagem': f'Erro no servidor: {e}'}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/login', methods=['POST'])
def login_usuario():
    dados = request.get_json()
    email = dados.get('email')
    senha_digitada = dados.get('senha')

    if not all([email, senha_digitada]):
        return jsonify({'sucesso': False, 'mensagem': 'E-mail e senha são obrigatórios.'}), 400

    conn = get_db_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM usuarios WHERE email = ?", (email,))
    usuario = cursor.fetchone()
    conn.close()

    if usuario and check_password_hash(usuario['senha_hash'], senha_digitada):
        
        additional_claims = {'is_admin': usuario['is_admin']}
        
        access_token = create_access_token(
            identity=str(usuario['id']),
            additional_claims=additional_claims
        )
        
        return jsonify({
            'sucesso': True, 
            'mensagem': 'Login bem-sucedido!',
            'access_token': access_token,
            'nome_usuario': usuario['nome'],
            'is_admin': usuario['is_admin']
        }), 200
    else:
        return jsonify({'sucesso': False, 'mensagem': 'E-mail ou senha inválidos.'}), 401


# ===============================================
# --- API de Pets ---
# ===============================================
@app.route('/api/meus-pets', methods=['GET'])
@jwt_required()
def get_meus_pets():
    usuario_id = get_jwt_identity() 
    conn = get_db_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT id, nome, especie, raca FROM pets WHERE dono_id = ?", (usuario_id,))
    pets = cursor.fetchall()
    conn.close()
    lista_pets = [dict(pet) for pet in pets]
    return jsonify({'sucesso': True, 'pets': lista_pets}), 200

@app.route('/api/cadastrar-pet', methods=['POST'])
@jwt_required()
def cadastrar_pet():
    usuario_id = get_jwt_identity()
    dados = request.get_json()
    
    nome = dados.get('nome')
    especie = dados.get('especie')
    raca = dados.get('raca')
    nascimento = dados.get('nascimento') 

    if not all([nome, especie]):
        return jsonify({'sucesso': False, 'mensagem': 'Nome e espécie são obrigatórios.'}), 400

    conn = get_db_conn()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO pets (nome, especie, raca, nascimento, dono_id) VALUES (?, ?, ?, ?, ?)",
            (nome, especie, raca, nascimento, usuario_id)
        )
        conn.commit()
        conn.close()
        return jsonify({'sucesso': True, 'mensagem': 'Pet cadastrado com sucesso!'}), 201
    
    except sqlite3.Error as e:
        if conn:
            conn.rollback() 
            conn.close()
        print(f"Erro ao cadastrar pet: {e}")
        return jsonify({'sucesso': False, 'mensagem': f'Erro no servidor: {e}'}), 500


# ===============================================
# --- API de Agendamentos ---
# ===============================================
@app.route('/api/agendar', methods=['POST'])
@jwt_required()
def agendar_horario():
    usuario_id = get_jwt_identity()
    dados = request.get_json()
    pet_id = dados.get('pet_id')
    servico = dados.get('servico')
    data = dados.get('data')
    hora = dados.get('hora')
    telefone = dados.get('telefone')
    if not all([pet_id, servico, data, hora, telefone]):
        return jsonify({'sucesso': False, 'mensagem': 'Dados incompletos.'}), 400
    conn = None
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM agendamentos WHERE data = ? AND hora = ?", (data, hora))
        if cursor.fetchone():
            return jsonify({'sucesso': False, 'mensagem': f'Horário ocupado! O dia {data} às {hora} já está reservado.'}), 409
        cursor.execute(
            "INSERT INTO agendamentos (usuario_id, pet_id, servico, data, hora, telefone) VALUES (?, ?, ?, ?, ?, ?)",
            (usuario_id, pet_id, servico, data, hora, telefone)
        )
        conn.commit()
        return jsonify({'sucesso': True, 'mensagem': 'Agendamento confirmado!'}), 201
    except sqlite3.Error as e:
        if conn: conn.rollback()
        return jsonify({'sucesso': False, 'mensagem': f'Erro no servidor: {e}'}), 500
    finally:
        if conn:
            conn.close()

# ===============================================
# --- ROTA DE ADMIN (AGORA SEGURA) ---
# ===============================================
@app.route('/api/admin/agendamentos', methods=['GET'])
@jwt_required()
def get_todos_agendamentos():
    
    claims = get_jwt()
    if claims.get('is_admin') != 1:
        return jsonify({'sucesso': False, 'mensagem': 'Acesso negado: rota apenas para administradores.'}), 403

    conn = None
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        query = """
            SELECT 
                a.data, a.hora, a.servico, a.telefone,
                p.nome AS pet_nome,
                u.nome AS tutor_nome
            FROM 
                agendamentos AS a
            JOIN pets AS p ON a.pet_id = p.id
            JOIN usuarios AS u ON a.usuario_id = u.id
            ORDER BY a.data, a.hora
        """
        cursor.execute(query)
        agendamentos_rows = cursor.fetchall()
        lista_agendamentos = [dict(row) for row in agendamentos_rows]
        return jsonify({'sucesso': True, 'agendamentos': lista_agendamentos}), 200

    except sqlite3.Error as e:
        print(f"Erro de banco de dados: {e}")
        return jsonify({'sucesso': False, 'mensagem': f'Erro no servidor: {e}'}), 500
    finally:
        if conn:
            conn.close()

# ==========================================================
# --- NOVA ROTA DO CLIENTE (MOVIDA PARA O LUGAR CORRETO) ---
# ==========================================================
@app.route('/api/meus-agendamentos', methods=['GET'])
@jwt_required() # Só precisa estar logado (seja admin ou não)
def get_meus_agendamentos():
    # Pega o ID do usuário que está logado
    usuario_id = get_jwt_identity()

    conn = None
    try:
        conn = get_db_conn()
        cursor = conn.cursor()

        # A consulta tem a cláusula "WHERE a.usuario_id = ?"
        query = """
            SELECT 
                a.data, a.hora, a.servico,
                p.nome AS pet_nome
            FROM 
                agendamentos AS a
            JOIN 
                pets AS p ON a.pet_id = p.id
            WHERE 
                a.usuario_id = ?
            ORDER BY 
                a.data, a.hora
        """
        
        cursor.execute(query, (usuario_id,))
        agendamentos_rows = cursor.fetchall()
        
        lista_agendamentos = [dict(row) for row in agendamentos_rows]

        return jsonify({'sucesso': True, 'agendamentos': lista_agendamentos}), 200

    except sqlite3.Error as e:
        print(f"Erro de banco de dados: {e}")
        return jsonify({'sucesso': False, 'mensagem': f'Erro no servidor: {e}'}), 500
    finally:
        if conn:
            conn.close()


# ===============================================
# --- Roda o servidor (DEVE SER A ÚLTIMA COISA) ---
# ===============================================
if __name__ == '__main__':
    print("Servidor (com login) rodando em http://127.0.0.1:5000")
    app.run(debug=True, port=5000)