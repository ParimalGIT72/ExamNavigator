from huggingface_hub import login
from dotenv import load_dotenv
import os

load_dotenv()
login(os.getenv("HF_TOKEN"))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

# 🔒 Optional: Load from env if needed
# from dotenv import load_dotenv
# load_dotenv()

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or use ["http://localhost:5173"] for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 🔧 Load Mixtral model
model_name = "mistralai/Mixtral-8x7B-Instruct-v0.1"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto"
)

# 📬 Input format
class Message(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(request: Message):
    user_input = request.message

    prompt = f"[INST] {user_input} [/INST]"

    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    with torch.no_grad():
        output = model.generate(**inputs, max_new_tokens=256)
    
    decoded = tokenizer.decode(output[0], skip_special_tokens=True)
    response = decoded.replace(prompt, "").strip()

    return {"response": response}
