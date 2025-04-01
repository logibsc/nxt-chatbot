from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os
from typing import Optional
from fastapi.responses import JSONResponse
from PyPDF2 import PdfReader
import docx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-pro")

@app.get("/")
async def home():
    return {"message": "fastapi works well"}

@app.post("/chat")
async def chat(prompt: str = Form(...)):
    response = model.generate_content(prompt)
    return {"response": response.text}

@app.post("/upload/image")
async def upload_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    response = model.generate_content([{"mime_type": file.content_type, "data": image_bytes}])
    return {"response": response.text}

@app.post("/upload/document")
async def upload_document(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        if file.content_type == "application/pdf":
            pdf_reader = PdfReader(file.file)
            content = "\n".join([page.extract_text() or "" for page in pdf_reader.pages])

        elif file.content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
            doc = docx.Document(file.file)
            content = "\n".join([para.text for para in doc.paragraphs])

        else:
            content = file_bytes.decode("utf-8", errors = "ignore")

        response = model.generate_content(content)
        return {"response": response.text}

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)