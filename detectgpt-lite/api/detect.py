from http.server import BaseHTTPRequestHandler
import json
import re
import math
from collections import Counter
from urllib.parse import parse_qs
import sys

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/detect' or self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response = {
                "status": "healthy",
                "service": "DetectGPT-Lite AI Detection",
                "version": "1.0.0",
                "method": "Heuristic Analysis"
            }
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(404)
    
    def do_POST(self):
        if self.path == '/api/detect':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                data = json.loads(post_data.decode('utf-8'))
                
                text = data.get('text', '')
                if not text or len(text.strip()) < 10:
                    self.send_error(400, "Text must be at least 10 characters long")
                    return
                
                result = analyze_text(text.strip())
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Content-Type')
                self.end_headers()
                
                self.wfile.write(json.dumps(result).encode())
                
            except Exception as e:
                self.send_error(500, str(e))
        else:
            self.send_error(404)
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def calculate_perplexity_score(text):
    """Calculate a simplified perplexity-like score"""
    words = text.lower().split()
    if len(words) < 5:
        return 50.0
    
    # Calculate word frequency distribution
    word_freq = Counter(words)
    total_words = len(words)
    unique_words = len(word_freq)
    
    # Calculate entropy-like measure
    entropy = 0
    for count in word_freq.values():
        prob = count / total_words
        entropy -= prob * math.log2(prob)
    
    # Normalize entropy (higher entropy = more human-like)
    max_entropy = math.log2(unique_words) if unique_words > 1 else 1
    normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0
    
    # Convert to AI likelihood (lower entropy = higher AI likelihood)
    ai_score = (1 - normalized_entropy) * 100
    
    return max(0, min(100, ai_score))

def detect_ai_patterns(text):
    """Detect AI-specific patterns in text"""
    ai_patterns = [
        r'\b(it\'s important to note|it\'s worth noting|it\'s crucial to understand)\b',
        r'\b(in conclusion|to summarize|in summary)\b',
        r'\b(furthermore|moreover|additionally|consequently)\b',
        r'\b(delve into|dive deep|explore in depth)\b',
        r'\b(let\'s explore|let\'s examine|let\'s consider)\b',
        r'\b(comprehensive|multifaceted|holistic approach)\b',
        r'\b(it\'s essential to|it\'s vital to|it\'s critical to)\b'
    ]
    
    pattern_count = 0
    for pattern in ai_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        pattern_count += len(matches)
    
    return pattern_count

def detect_human_patterns(text):
    """Detect human-specific patterns in text"""
    human_patterns = [
        r'\b(I|me|my|mine|myself)\b',
        r'\b(don\'t|won\'t|can\'t|isn\'t|aren\'t)\b',
        r'\b(yeah|yep|nope|gonna|wanna|gotta)\b',
        r'\b(amazing|awesome|terrible|horrible|fantastic)\b',
        r'\b(maybe|perhaps|possibly|probably|I think)\b'
    ]
    
    pattern_count = 0
    for pattern in human_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        pattern_count += len(matches)
    
    return pattern_count

def analyze_text_structure(text):
    """Analyze text structure for AI detection"""
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    if len(sentences) < 2:
        return {"consistency": 0.5, "variation": 0.5}
    
    # Calculate sentence length variation
    lengths = [len(s.split()) for s in sentences]
    avg_length = sum(lengths) / len(lengths)
    variance = sum((l - avg_length) ** 2 for l in lengths) / len(lengths)
    variation = min(1.0, math.sqrt(variance) / avg_length) if avg_length > 0 else 0
    
    # Calculate consistency (AI tends to be more consistent)
    consistency = 1 - variation
    
    return {"consistency": consistency, "variation": variation}

def analyze_text(text):
    """Main analysis function"""
    try:
        # Calculate various metrics
        perplexity_score = calculate_perplexity_score(text)
        ai_patterns = detect_ai_patterns(text)
        human_patterns = detect_human_patterns(text)
        structure = analyze_text_structure(text)
        
        # Word and sentence statistics
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        word_count = len(words)
        sentence_count = len(sentences)
        avg_words_per_sentence = word_count / max(sentence_count, 1)
        
        # Calculate final AI likelihood
        ai_likelihood = 0
        
        # Perplexity contribution (40%)
        ai_likelihood += perplexity_score * 0.4
        
        # Pattern analysis (30%)
        pattern_score = (ai_patterns * 10) - (human_patterns * 5)
        pattern_score = max(0, min(100, 50 + pattern_score))
        ai_likelihood += pattern_score * 0.3
        
        # Structure consistency (20%)
        consistency_score = structure["consistency"] * 100
        ai_likelihood += consistency_score * 0.2
        
        # Length and complexity (10%)
        if avg_words_per_sentence > 20:  # Very long sentences might indicate AI
            ai_likelihood += 10 * 0.1
        elif avg_words_per_sentence < 8:  # Very short might indicate human
            ai_likelihood -= 10 * 0.1
        
        # Normalize final score
        ai_likelihood = max(0, min(100, ai_likelihood))
        human_likelihood = 100 - ai_likelihood
        
        # Determine confidence
        if word_count < 50:
            confidence = "low"
        elif word_count > 200 and (ai_likelihood < 20 or ai_likelihood > 80):
            confidence = "high"
        elif word_count > 100 and (ai_likelihood < 30 or ai_likelihood > 70):
            confidence = "medium-high"
        else:
            confidence = "medium"
        
        # Generate verdict
        if ai_likelihood >= 80:
            verdict = "Highly likely AI-generated content"
        elif ai_likelihood >= 60:
            verdict = "Likely AI-generated content"
        elif ai_likelihood >= 40:
            verdict = "Mixed or uncertain - may contain AI assistance"
        elif ai_likelihood >= 20:
            verdict = "Likely human-written content"
        else:
            verdict = "Highly likely human-written content"
        
        # Raw metrics for debugging
        raw_metrics = {
            "perplexity_score": perplexity_score,
            "ai_patterns": ai_patterns,
            "human_patterns": human_patterns,
            "structure_consistency": structure["consistency"],
            "structure_variation": structure["variation"],
            "word_count": word_count,
            "sentence_count": sentence_count,
            "avg_words_per_sentence": avg_words_per_sentence
        }
        
        return {
            "aiLikelihood": int(round(ai_likelihood)),
            "humanLikelihood": int(round(human_likelihood)),
            "confidence": confidence,
            "verdict": verdict,
            "score": ai_likelihood / 100.0,
            "raw_metrics": raw_metrics,
            "method": "DetectGPT-Lite (Advanced Heuristic Analysis)"
        }
        
    except Exception as e:
        # Fallback response
        return {
            "aiLikelihood": 50,
            "humanLikelihood": 50,
            "confidence": "low",
            "verdict": "Analysis failed - using neutral score",
            "score": 0.5,
            "raw_metrics": {"error": str(e)},
            "method": "Error Fallback"
        }
