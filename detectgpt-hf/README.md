# DetectGPT-Lite AI Content Detection

Advanced heuristic analysis for detecting AI-generated content in educational submissions.

## Features

- **Advanced Pattern Recognition**: Detects common AI writing patterns and human writing indicators
- **Perplexity Analysis**: Uses entropy-based scoring similar to DetectGPT methodology
- **Structure Analysis**: Evaluates sentence consistency and variation
- **Confidence Scoring**: Provides reliability estimates based on text length and analysis
- **API Access**: RESTful API for integration with external applications

## Usage

### Web Interface
Simply paste your text into the interface and click "Analyze Text" to get detailed AI detection results.

### API Access
Send POST requests to `/api/detect_api` with JSON payload:
```json
{
  "data": ["Your text to analyze here"]
}
```

## Method
This tool uses a combination of:
- Entropy-based perplexity scoring
- Pattern matching for AI/human indicators  
- Structural consistency analysis
- Statistical text metrics

## Integration
Perfect for educational platforms requiring AI content detection in student submissions.
