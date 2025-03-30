from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
import requests
import os
import base64
import mimetypes
import csv
import json
from fastapi.middleware.cors import CORSMiddleware
from docx import Document

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ChatRequest(BaseModel):
    message: str
    
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is missing!")

async def process_document(file: UploadFile):
    ext = file.filename.split(".")[-1].lower()

    if ext =="pdf":
        document_bytes = await file.read()
        return base64.b64encode(document_bytes).decode("utf-8")
    
    elif ext == "txt":
        return (await file.read()).decode("utf-8")
    
    elif ext == "docx":
        doc = Document(file.file)
        return "\n".join([para.text for para in doc.paragraphs])
    
    elif ext == "csv":
        decoded = (await file.read()).decode("utf-8").splitlines()
        reader = list(csv.reader(decoded))
        return "\n".join([", ".join(row) for row in reader])
    
    elif ext == "json":
        json_data = json.loads((await file.read()).decode("utf-8"))
        return json.dumps(json_data, indent = 2)
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format")

@app.get("/")
async def home():
    return {"message": "Chatbot is running"}

@app.post("/chat")
async def chat(request: ChatRequest):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message is required")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": request.message}]}]
    }
    headers = {"Content-Type": "application/json"}

    response = requests.post(url, json=payload, headers=headers)
    
    try:
        data = response.json()
        print("full api response:", data)

        ai_response = (
            data.get("candidates", [{}])[0]
            .get("content", {})
            .get("parts", [{}])[0]
            .get("text", "Sorry, I couldn't generate a response.")
        )

        return {"response": ai_response}
    
    except Exception as e:
        print("Error: ", str(e))
        return {"response": "An error occured while processing your request."}
    
@app.post("/upload/image")
async def upload_image(file: UploadFile = File(...), user_query: str = Form(...)):
    if not file:
        raise HTTPException(status_code=400, detail="Image file is required")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={GEMINI_API_KEY}"
    
    # Read image bytes
    image_bytes = await file.read()
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")
    
    # Gemini expects images in base64 format
    payload = {
        "contents": [{
            "parts": [
                {"text": user_query},
                {"inline_data": {"mime_type": file.content_type, "data": image_base64}}
            ]
        }]
    }
    
    headers = {"Content-Type": "application/json"}
    response = requests.post(url, json=payload, headers=headers)
    
    try:
        data = response.json()
        print("🔍 Full API Response:", data)

        # Extract the response like we did before
        ai_response = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "Couldn't analyze the image.")

        return {"response": ai_response}

    except Exception as e:
        print("❌ Error:", str(e))
        return {"response": "An error occurred while analyzing the image."}

@app.post("/upload_document")
async def upload_document(file: UploadFile = File(...), user_query: str = Form(...)):
    if not file:
        raise HTTPException(status_code=400, detail="Document file is required")
    
    try:
        ext = file.filename.split(".")[-1].lower()
        document_content = await process_document(file)

        mime_type = mimetypes.guess_type(file.filename)[0] or "application/octet-stream"

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}

        if ext == "pdf":
            payload = {
                "contents": [{
                    "parts": [
                        {"text": user_query},
                        {"inline_data": {"mime_type": mime_type, "data": document_content}}
                    ]
                }]
            }
        else:
            payload = {
                "contents": [{
                    "parts": [
                        {"text": f"{user_query}\n\nHere is the document content:\n{document_content}"}
                    ]
                }]
            }
        
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()

        print("Full api response:", data)

        ai_response = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "couldn't analyze the document.")

        return {"response": ai_response}
    
    except Exception as e:
        print("Error: ", str(e))
        return {"response": "An error occured while analyzing the document."}