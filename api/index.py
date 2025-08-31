import os
import sys
from flask import Flask, send_from_directory
from flask_cors import CORS

# Adiciona o diretório pai ao sys.path para que o Flask possa encontrar os módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from src.routes.faq import faq_bp

app = Flask(__name__)
CORS(app) # Habilita CORS para todas as rotas

app.register_blueprint(faq_bp, url_prefix="/api/faq")

@app.route("/")
def home():
    return "Vercel Flask API for FAQ Agent"

# Para Vercel, o WSGI app é a própria instância do Flask
# Não precisamos de `if __name__ == '__main__':`
# A Vercel vai chamar `app` diretamente


