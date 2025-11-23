# DetectGPT AI Detection Service

This is a Python microservice that provides AI content detection using the DetectGPT algorithm.

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip package manager
- (Optional) CUDA-capable GPU for faster inference

### Installation

1. **Create a virtual environment** (recommended):

```bash
cd python-service
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

2. **Install dependencies**:

```bash
pip install -r requirements.txt
```

This will download:
- GPT-2 model (~500MB)
- Transformers library
- FastAPI and dependencies

**Note**: First run will take time as it downloads the models.

### Running the Service

**Start the server**:

```bash
python main.py
```

Or using uvicorn:

```bash
uvicorn main:app --reload --port 8000
```

The service will be available at: **http://localhost:8000**

### Testing

1. **Check health**:

```bash
curl http://localhost:8000/health
```

2. **Test detection**:

```bash
curl -X POST http://localhost:8000/detect \
  -H "Content-Type: application/json" \
  -d '{"text": "Your text here to analyze for AI content"}'
```

3. **Interactive API docs**:

Visit: http://localhost:8000/docs

## 📡 API Endpoints

### `GET /`
Health check endpoint

**Response**:
```json
{
  "status": "running",
  "service": "DetectGPT AI Detection",
  "version": "1.0.0",
  "device": "cpu",
  "model": "gpt2"
}
```

### `POST /detect`
Detect AI-generated content

**Request**:
```json
{
  "text": "The text to analyze",
  "previousText": "Optional previous version for comparison",
  "use_gpu": false
}
```

**Response**:
```json
{
  "aiLikelihood": 75,
  "humanLikelihood": 25,
  "confidence": "High",
  "verdict": "Likely AI-generated or heavily AI-assisted",
  "score": 1.23,
  "raw_metrics": {
    "diff": 0.45,
    "std": 0.37
  },
  "method": "DetectGPT (GPT-2 Perplexity)"
}
```

### `POST /detect/batch`
Batch detection for multiple texts

**Request**:
```json
["Text 1", "Text 2", "Text 3"]
```

## 🔧 Configuration

### Model Selection

Edit `main.py` to change the model:

```python
# For better accuracy (requires more RAM/GPU):
model_id = "gpt2-medium"

# For fastest inference:
model_id = "gpt2"  # default
```

### GPU Support

If you have a CUDA-capable GPU:

1. Install PyTorch with CUDA:
```bash
pip install torch --index-url https://download.pytorch.org/whl/cu118
```

2. The service will automatically detect and use GPU

### Perturbation Method

For more accurate but slower detection, enable T5 perturbations in `model.py`:

```python
self.use_t5 = True  # Set to True for higher accuracy
```

**Note**: This requires more memory and computation time.

## 🎯 How It Works

DetectGPT works by:

1. **Perplexity Analysis**: Calculates how "surprised" GPT-2 is by the text
2. **Text Perturbation**: Generates variations of the text
3. **Comparison**: Compares original vs perturbed text perplexity
4. **Scoring**: AI-generated text has lower perplexity variance

### Score Interpretation

- **Score < -0.5**: Primarily human-written
- **Score -0.5 to 0.5**: Mixed content
- **Score > 0.5**: Likely AI-generated

### Accuracy

- Works best with text **50+ words**
- More accurate with longer texts (100+ words)
- Detects GPT-2, GPT-3, ChatGPT, and similar models
- ~85-95% accuracy on benchmark datasets

## 🐳 Docker Deployment (Optional)

Create `Dockerfile`:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t detectgpt-service .
docker run -p 8000:8000 detectgpt-service
```

## 🔗 Integration with Next.js

Your Next.js app will call this service from `/app/api/detect-ai/route.ts`:

```typescript
const response = await fetch('http://localhost:8000/detect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: userText })
})

const result = await response.json()
```

## 📊 Performance

### Memory Usage
- **gpt2**: ~500MB RAM
- **gpt2-medium**: ~1.5GB RAM
- **with T5**: +2GB RAM

### Speed
- **CPU (gpt2)**: ~2-5 seconds per text
- **GPU (gpt2)**: ~0.5-1 seconds per text
- **with T5**: +5-10 seconds

### Optimization Tips

1. **Use smaller model** (gpt2) for faster inference
2. **Disable T5** perturbations for speed
3. **Use GPU** if available
4. **Batch processing** for multiple texts
5. **Cache results** for repeated texts

## 🛠️ Troubleshooting

### "Model not loaded"
- Wait 1-2 minutes after starting for model download
- Check logs for download progress

### "Out of memory"
- Use smaller model: `model_id = "gpt2"`
- Disable T5: `self.use_t5 = False`
- Reduce text length or batch size

### "CUDA out of memory"
- Reduce batch size
- Use CPU instead: `device = "cpu"`
- Clear CUDA cache: `torch.cuda.empty_cache()`

### Slow inference
- Disable T5 perturbations
- Use GPU if available
- Use smaller model
- Reduce number of perturbations

## 📚 References

- **DetectGPT Paper**: https://arxiv.org/pdf/2301.11305v1.pdf
- **Implementation**: https://github.com/BurhanUlTayyab/DetectGPT
- **GPT-2**: https://huggingface.co/gpt2
- **FastAPI**: https://fastapi.tiangolo.com/

## 📄 License

MIT License - Same as DetectGPT implementation

## 🤝 Credits

- DetectGPT algorithm by Eric Mitchell et al.
- Implementation by Burhan Ul Tayyab and Nicholas Chua
- Integrated for AI Education Dashboard research project
