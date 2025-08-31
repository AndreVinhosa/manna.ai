import json
import os
from flask import Blueprint, request, jsonify
from difflib import SequenceMatcher
import google.generativeai as genai

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

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")

def similarity(a, b):
    """Calculate similarity between two strings."""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def find_best_answer(question):
    """Find the best answer for a given question from local FAQ data."""
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

def get_gemini_answer(question):
    """Get an answer from Gemini API."""
    try:
        # Construct a prompt that encourages Gemini to act as a helpful FAQ assistant
        # and potentially use the provided FAQ data as context.
        prompt_parts = [
            "Você é um assistente de FAQ para a Manna Bridge. Responda à seguinte pergunta de forma concisa e útil.",
            "Se a pergunta for sobre a Manna Bridge, use as informações fornecidas no FAQ abaixo como base para sua resposta.",
            "Perguntas e Respostas do FAQ da Manna Bridge:\n\n"
        ]
        for item in faq_data:
            prompt_parts.append(f"Q: {item["question"]}\nA: {item["answer"]}\n")
        
        prompt_parts.append(f"\nPergunta do usuário: {question}")
        prompt_parts.append("Resposta:")

        response = model.generate_content("\n".join(prompt_parts))
        return response.text
    except Exception as e:
        print(f"Erro ao chamar Gemini: {e}")
        return None

def analyze_sentiment(text):
    """Analyze the sentiment of a given text using Gemini."""
    try:
        sentiment_prompt = f"Analise o sentimento do seguinte texto e classifique-o como POSITIVO, NEGATIVO ou NEUTRO. Responda apenas com a palavra de classificação.\nTexto: {text}"
        response = model.generate_content(sentiment_prompt)
        return response.text.strip().upper()
    except Exception as e:
        print(f"Erro ao analisar sentimento com Gemini: {e}")
        return "NEUTRO" # Default to neutral if analysis fails

@faq_bp.route("/ask", methods=["POST"])
def ask_question():
    """Handle user questions."""
    data = request.get_json()
    question = data.get("question", "").strip()
    
    if not question:
        return jsonify({"error": "Pergunta não pode estar vazia"}), 400
    
    # Analyze sentiment of the user's question
    sentiment = analyze_sentiment(question)

    # First, try to find an answer in the local FAQ data
    answer_data, score = find_best_answer(question)
    
    if answer_data and score > 0.7: # Use local FAQ if confidence is high
        return jsonify({
            "answer": answer_data["answer"],
            "question": question,
            "section": answer_data.get("section", ""),
            "confidence": score,
            "sentiment": sentiment
        })
    else:
        # If no high-confidence answer from local FAQ, try Gemini
        gemini_answer = get_gemini_answer(question)
        if gemini_answer:
            return jsonify({
                "answer": gemini_answer,
                "question": question,
                "section": "Gerado por IA (Gemini)",
                "confidence": 1.0, # Assume high confidence from Gemini
                "sentiment": sentiment
            })
        else:
            # Fallback to human support if Gemini also fails or no high-confidence local answer
            return jsonify({
                "answer": "Desculpe, não encontrei uma resposta para sua pergunta. Você gostaria de falar com um atendente humano?",
                "question": question,
                "section": "",
                "confidence": 0,
                "suggest_human": True,
                "sentiment": sentiment
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
