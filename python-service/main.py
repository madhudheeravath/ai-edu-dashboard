#!/usr/bin/env python3
"""
FastAPI server for DetectGPT AI content detection
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import torch
from model import GPT2PPL

app = FastAPI(
    title="DetectGPT API",
    description="AI content detection using DetectGPT algorithm",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://ai-edu-dashboard-sigma.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instance
detector = None

class DetectionRequest(BaseModel):
    text: str
    previousText: Optional[str] = None
    use_gpu: Optional[bool] = False

class DetectionResponse(BaseModel):
    aiLikelihood: int
    humanLikelihood: int
    confidence: str
    verdict: str
    score: float
    raw_metrics: dict
    method: str = "DetectGPT"

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    global detector
    
    # Check if CUDA is available
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model_id = "gpt2"  # Use gpt2-medium for better accuracy if you have more RAM
    
    print(f"Initializing DetectGPT with device: {device}, model: {model_id}")
    detector = GPT2PPL(device=device, model_id=model_id)
    print("DetectGPT loaded successfully!")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "service": "DetectGPT AI Detection",
        "version": "1.0.0",
        "device": detector.device if detector else "not loaded",
        "model": detector.model_id if detector else "not loaded"
    }

@app.get("/health")
async def health():
    """Health check"""
    if detector is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {"status": "healthy", "model_loaded": True}

@app.post("/detect", response_model=DetectionResponse)
async def detect_ai(request: DetectionRequest):
    """
    Detect if text is AI-generated
    
    - **text**: The text to analyze
    - **previousText**: Optional previous version to compare
    - **use_gpu**: Whether to use GPU (if available)
    """
    if detector is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")
    
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        # Analyze the text
        result = detector.analyze(request.text)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return DetectionResponse(
            aiLikelihood=result["aiLikelihood"],
            humanLikelihood=result["humanLikelihood"],
            confidence=result["confidence"],
            verdict=result["verdict"],
            score=result["score"],
            raw_metrics=result["raw_metrics"],
            method="DetectGPT (GPT-2 Perplexity)"
        )
    
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        # Log error for debugging
        print(f"ERROR analyzing text: {str(e)}")
        print(f"Text length: {len(request.text)} chars, {len(request.text.split())} words")
        
        # Return safe fallback instead of crashing
        return DetectionResponse(
            aiLikelihood=50,
            humanLikelihood=50,
            confidence="low",
            verdict="Analysis failed - using neutral score",
            score=0.0,
            raw_metrics={"error": str(e)},
            method="Error Fallback"
        )

@app.post("/detect/batch")
async def detect_ai_batch(texts: list[str]):
    """Batch detection endpoint"""
    if detector is None:
        raise HTTPException(status_code=503, detail="Model not loaded yet")
    
    results = []
    for text in texts:
        try:
            result = detector.analyze(text)
            results.append(result)
        except Exception as e:
            results.append({"error": str(e)})
    
    return {"results": results}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
