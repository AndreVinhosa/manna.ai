import json
import os
from flask import Blueprint, request, jsonify
from difflib import SequenceMatcher

faq_bp = Blueprint("faq", __name__)

# Determine the base directory for the application
# This handles both local execution and Vercel deployment
if os.getenv("VERCEL"):
    # On Vercel, the current working directory is the project root
    FAQ_DATA_PATH = os.path.join(os.getcwd(), "src", "faq_data.json")
else:
    # Local development
    FAQ_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "faq_data.json")

# Load FAQ data
with open(FAQ_DATA_PATH, "r", encoding="utf-8") as f:
    faq_data = json.load(f)

def similarity(a, b):
    """Calculate similarity between two strings."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def find_best_answer(question):
    """Find the best answer for a given question."""
    best_match = None
    best_score = 0
    
    for item in faq_data:
        score = similarity(question, item["question"])
        if score > best_score:
            best_score = score
            best_match = item
    
    # Only return answer if similarity is above threshold
    if best_score > 0.3:  # 30% similarity threshold
        return best_match, best_score
    
    return None, 0

@faq_bp.route("/ask", methods=["POST"])
def ask_question():
    """Handle user questions."""
    data = request.get_json()
    question = data.get("question", "").strip()
    
    if not question:
        return jsonify({"error": "Pergunta não pode estar vazia"}), 400
    
    answer_data, score = find_best_answer(question)
    
    if answer_data:
        return jsonify({
            "answer": answer_data["answer"],
            "question": answer_data["question"],
            "section": answer_data.get("section", ""),
            "confidence": score
        })
    else:
        return jsonify({
            "answer": "Desculpe, não encontrei uma resposta para sua pergunta. Você gostaria de falar com um atendente humano?",
            "question": question,
            "section": "",
            "confidence": 0,
            "suggest_human": True
        })

@faq_bp.route("/feedback", methods=["POST"])
def submit_feedback():
    """Handle user feedback."""
    data = request.get_json()
    question = data.get("question", "")
    answer = data.get("answer", "")
    feedback = data.get("feedback", "")  # "like" or "dislike"
    
    # Here you could save feedback to database
    # For now, just log it
    print(f"Feedback received: {feedback} for question: {question}")
    
    return jsonify({"status": "success", "message": "Obrigado pelo seu feedback!"})

@faq_bp.route("/human-support", methods=["POST"])
def request_human_support():
    """Handle requests for human support."""
    data = request.get_json()
    question = data.get("question", "")
    user_info = data.get("user_info", {})
    
    # Here you could integrate with a ticketing system or live chat
    # For now, just log the request
    print(f"Human support requested for question: {question}")
    print(f"User info: {user_info}")
    
    return jsonify({
        "status": "success", 
        "message": "Sua solicitação foi enviada para nossa equipe de atendimento. Entraremos em contato em breve!"
    })

@faq_bp.route("/categories", methods=["GET"])
def get_categories():
    """Get all FAQ categories."""
    categories = list(set(item.get("section", "Geral") for item in faq_data))
    return jsonify({"categories": categories})

@faq_bp.route("/questions/<category>", methods=["GET"])
def get_questions_by_category(category):
    """Get questions by category."""
    questions = [item for item in faq_data if item.get("section", "Geral") == category]
    return jsonify({"questions": questions})


