#!/usr/bin/env python3
"""
DetectGPT Model Implementation
Modified from: https://github.com/BurhanUlTayyab/DetectGPT

This code uses GPT-2 perplexity to detect AI-generated text.
Published under the MIT license.
"""
import time
import torch
import itertools
import math
import numpy as np
import re
import transformers
from transformers import GPT2LMHeadModel, GPT2TokenizerFast
from transformers import T5Tokenizer
from scipy.stats import norm
from difflib import SequenceMatcher
from multiprocessing.pool import ThreadPool

def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

def normCdf(x):
    return norm.cdf(x)

def likelihoodRatio(x, y):
    return normCdf(x)/normCdf(y)

torch.manual_seed(0)
np.random.seed(0)

class GPT2PPL:
    def __init__(self, device="cpu", model_id="gpt2"):
        """
        Initialize DetectGPT with GPT-2 model
        Note: Using 'cpu' and 'gpt2' (small) for better compatibility
        For better accuracy, use 'cuda' and 'gpt2-medium' if GPU is available
        """
        self.device = device
        self.model_id = model_id
        
        print(f"Loading {model_id} model on {device}...")
        self.model = GPT2LMHeadModel.from_pretrained(model_id).to(device)
        self.tokenizer = GPT2TokenizerFast.from_pretrained(model_id)

        self.max_length = self.model.config.n_positions
        self.stride = 512
        self.threshold = 0.5  # Adjusted threshold

        # T5 for text perturbation (optional, can be disabled for faster inference)
        self.use_t5 = False  # Set to True for more accurate detection but slower
        if self.use_t5:
            print("Loading T5 model for text perturbation...")
            self.t5_model = transformers.AutoModelForSeq2SeqLM.from_pretrained("t5-base").to(device)
            self.t5_tokenizer = T5Tokenizer.from_pretrained("t5-base", model_max_length=512)

    def getLogLikelihood(self, text):
        """Calculate log-likelihood of text using GPT-2"""
        with torch.no_grad():
            encodings = self.tokenizer(text, return_tensors="pt")
            seq_len = encodings.input_ids.size(1)

            nlls = []
            prev_end_loc = 0
            for begin_loc in range(0, seq_len, self.stride):
                end_loc = min(begin_loc + self.max_length, seq_len)
                trg_len = end_loc - prev_end_loc
                input_ids = encodings.input_ids[:, begin_loc:end_loc].to(self.device)
                target_ids = input_ids.clone()
                target_ids[:, :-trg_len] = -100

                outputs = self.model(input_ids, labels=target_ids)
                neg_log_likelihood = outputs.loss

                nlls.append(neg_log_likelihood)

                prev_end_loc = end_loc
                if end_loc == seq_len:
                    break

            return -torch.stack(nlls).mean()

    def apply_extracted_fills(self, masked_texts, extracted_fills):
        """Apply T5 fills to masked text"""
        texts = []
        for idx, (text, fills) in enumerate(zip(masked_texts, extracted_fills)):
            tokens = list(re.finditer("<extra_id_\\d+>", text))
            if len(fills) < len(tokens):
                continue

            offset = 0
            for fill_idx in range(len(tokens)):
                start, end = tokens[fill_idx].span()
                text = text[:start+offset] + fills[fill_idx] + text[end+offset:]
                offset = offset - (end - start) + len(fills[fill_idx])
            texts.append(text)

        return texts

    def unmasker(self, text, num_of_masks):
        """Use T5 to fill masked tokens"""
        if not self.use_t5:
            return []
            
        num_of_masks = max(num_of_masks)
        stop_id = self.t5_tokenizer.encode(f"<extra_id_{num_of_masks}>")[0]
        tokens = self.t5_tokenizer(text, return_tensors="pt", padding=True)
        for key in tokens:
            tokens[key] = tokens[key].to(self.device)

        output_sequences = self.t5_model.generate(
            **tokens, 
            max_length=512, 
            do_sample=True, 
            top_p=0.96, 
            num_return_sequences=1, 
            eos_token_id=stop_id
        )
        results = self.t5_tokenizer.batch_decode(output_sequences, skip_special_tokens=False)

        texts = [x.replace("<pad>", "").replace("</s>", "").strip() for x in results]
        pattern = re.compile("<extra_id_\\d+>")
        extracted_fills = [pattern.split(x)[1:-1] for x in texts]
        extracted_fills = [[y.strip() for y in x] for x in extracted_fills]

        perturbed_texts = self.apply_extracted_fills(text, extracted_fills)

        return perturbed_texts

    def maskRandomWord(self, text, ratio):
        """Mask random words in text for perturbation"""
        span = 2
        tokens = text.split(' ')
        mask_string = '<<<mask>>>'

        n_spans = ratio//(span + 2)

        n_masks = 0
        while n_masks < n_spans:
            start = np.random.randint(0, len(tokens) - span)
            end = start + span
            search_start = max(0, start - 1)
            search_end = min(len(tokens), end + 1)
            if mask_string not in tokens[search_start:search_end]:
                tokens[start:end] = [mask_string]
                n_masks += 1

        num_filled = 0
        for idx, token in enumerate(tokens):
            if token == mask_string:
                tokens[idx] = f'<extra_id_{num_filled}>'
                num_filled += 1
        
        text = ' '.join(tokens)
        return text, n_masks

    def getScore(self, sentence):
        """
        Calculate DetectGPT score
        Returns: (score, diff, std)
        Higher score = more likely AI-generated
        """
        original_sentence = sentence
        sentence_length = len(list(re.finditer("[^\\d\\W]+", sentence)))
        
        # For faster inference without T5, use alternative perturbation method
        if not self.use_t5:
            # FIXED: Set seed for consistent results
            np.random.seed(42)
            torch.manual_seed(42)
            
            # Get original perplexity
            log_likelihood = self.getLogLikelihood(original_sentence)
            
            # Generate simple perturbations by randomly dropping/replacing words
            perturbed_likelihoods = []
            words = original_sentence.split()
            
            if len(words) > 10:
                # Create MORE perturbations for better accuracy
                num_perturbations = min(30, max(15, len(words) // 4))
                
                for i in range(num_perturbations):
                    # Seed each perturbation for consistency
                    np.random.seed(42 + i)
                    
                    # Randomly drop 1-2 words or swap word order
                    perturbed = words.copy()
                    if len(perturbed) > 5:
                        # Drop a random word
                        idx = np.random.randint(1, len(perturbed) - 1)
                        perturbed.pop(idx)
                    
                    perturbed_text = " ".join(perturbed)
                    perturbed_ll = self.getLogLikelihood(perturbed_text)
                    perturbed_likelihoods.append(perturbed_ll.cpu().detach().numpy())
                
                # Calculate statistics
                perturbed_likelihoods = np.array(perturbed_likelihoods)
                mean_perturbed = np.mean(perturbed_likelihoods)
                std_perturbed = np.std(perturbed_likelihoods)
                
                original_ll = log_likelihood.cpu().detach().numpy()
                
                # DetectGPT theory: AI text has more curvature (higher score)
                # When we perturb AI text, it stays in high-probability region
                # When we perturb human text, perplexity varies more
                diff = original_ll - mean_perturbed
                
                # Normalize score - THIS IS THE ORIGINAL CORRECT LOGIC
                # Higher score = AI (perplexity doesn't change much when perturbed)
                # Lower score = Human (perplexity varies when perturbed)
                score = diff / (std_perturbed + 1e-10)
                
                return float(score), float(diff), float(std_perturbed)
            else:
                # Text too short, return neutral score
                return 0.0, 0.0, 1.0
        
        # Full DetectGPT with perturbations (slower but more accurate)
        remaining = min(50, max(20, sentence_length // 2))
        
        real_log_likelihood = self.getLogLikelihood(original_sentence)
        
        # Generate perturbed versions
        sentences = []
        for i in range(remaining // 10):
            ratio = int(0.3 * sentence_length)
            mask_text, num_of_masks = self.maskRandomWord(original_sentence, ratio)
            perturbed = self.unmasker([mask_text], [num_of_masks])
            sentences.extend(perturbed)
        
        if len(sentences) == 0:
            score = -float(real_log_likelihood.cpu().detach().numpy())
            return score, score, 1.0
        
        generated_log_likelihoods = []
        for sentence in sentences:
            generated_log_likelihoods.append(
                self.getLogLikelihood(sentence).cpu().detach().numpy()
            )

        generated_log_likelihoods = np.asarray(generated_log_likelihoods)
        mean_generated_log_likelihood = np.mean(generated_log_likelihoods)
        std_generated_log_likelihood = np.std(generated_log_likelihoods)

        # Original DetectGPT logic
        diff = real_log_likelihood.cpu().detach().numpy() - mean_generated_log_likelihood
        score = diff / (std_generated_log_likelihood + 1e-10)

        return float(score), float(diff), float(std_generated_log_likelihood)

    def getVerdict(self, score):
        """Get human-readable verdict from score"""
        # Much more aggressive thresholds
        if score > 0.7:
            return "Likely AI-generated or heavily AI-assisted", "High"
        elif score > 0.3:
            return "Likely AI-generated or heavily AI-assisted", "High"
        elif score > 0.05:
            return "Likely AI-generated or heavily AI-assisted", "Medium"
        elif score > -0.15:
            return "Mixed human and AI content", "Medium"
        elif score > -0.5:
            return "Primarily human-written", "Medium"
        else:
            return "Primarily human-written", "High"

    def analyze(self, text):
        """
        Main analysis function
        Returns dict with score, verdict, and confidence
        """
        if len(text.split()) < 30:
            return {
                "error": "Text too short. Please provide at least 30 words.",
                "min_words": 30
            }
        
        # Check if text is too long for model (GPT-2 max tokens ~1024)
        # Each word ~1.3 tokens on average
        words = text.split()
        max_words_per_chunk = 600  # ~780 tokens, safe limit
        
        if len(words) > max_words_per_chunk:
            # Split into chunks and analyze separately
            chunks = []
            for i in range(0, len(words), max_words_per_chunk):
                chunk = " ".join(words[i:i + max_words_per_chunk])
                chunks.append(chunk)
            
            # Analyze each chunk
            chunk_scores = []
            for i, chunk in enumerate(chunks):
                try:
                    score, diff, std = self.getScore(chunk)
                    chunk_scores.append(score)
                except Exception as e:
                    print(f"Error analyzing chunk {i+1}/{len(chunks)}: {e}")
                    # Continue with other chunks instead of failing completely
                    continue
            
            # Average the scores
            if not chunk_scores:
                # If all chunks failed, return neutral score instead of error
                print(f"WARNING: All chunks failed to analyze. Returning neutral score.")
                return {
                    "aiLikelihood": 50,
                    "humanLikelihood": 50,
                    "confidence": "low",
                    "verdict": "Unclear - analysis error",
                    "score": 0.0,
                    "raw_metrics": {
                        "error": "All text chunks failed analysis",
                        "total_chunks": len(chunks)
                    }
                }
            
            score = sum(chunk_scores) / len(chunk_scores)
            diff = 0.0  # Not meaningful for averaged scores
            std = 1.0
            print(f"Analyzed {len(chunk_scores)}/{len(chunks)} chunks successfully")
        else:
            # Normal analysis for shorter texts
            try:
                score, diff, std = self.getScore(text)
            except Exception as e:
                print(f"Error in single text analysis: {e}")
                # Return neutral score on error
                return {
                    "aiLikelihood": 50,
                    "humanLikelihood": 50,
                    "confidence": "low",
                    "verdict": "Unclear - analysis error",
                    "score": 0.0,
                    "raw_metrics": {"error": str(e)}
                }
        
        verdict, confidence = self.getVerdict(score)
        
        # Convert score to percentage (0-100)
        # ULTRA AGGRESSIVE: Match commercial detectors like ZeroGPT
        # Even small positive scores indicate AI
        if score > 1.5:
            ai_likelihood = 100  # Clearly AI
        elif score > 1.0:
            ai_likelihood = 98   # Almost certainly AI
        elif score > 0.7:
            ai_likelihood = 95   # Very likely AI
        elif score > 0.5:
            ai_likelihood = 92   # Highly likely AI
        elif score > 0.3:
            ai_likelihood = 88   # Likely AI
        elif score > 0.15:
            ai_likelihood = 82   # Probably AI
        elif score > 0.05:
            ai_likelihood = 75   # Likely AI
        elif score > 0:
            ai_likelihood = 68   # Slight AI lean
        elif score > -0.05:
            ai_likelihood = 55   # Barely AI
        elif score > -0.15:
            ai_likelihood = 42   # Barely human
        elif score > -0.3:
            ai_likelihood = 32   # Slight human lean
        elif score > -0.5:
            ai_likelihood = 22   # Likely human
        elif score > -0.7:
            ai_likelihood = 12   # Probably human
        elif score > -1.0:
            ai_likelihood = 5    # Very likely human
        elif score > -1.5:
            ai_likelihood = 2    # Almost certainly human
        else:
            ai_likelihood = 0    # Clearly human
        
        human_likelihood = 100 - ai_likelihood
        
        return {
            "score": float(score),
            "aiLikelihood": ai_likelihood,
            "humanLikelihood": human_likelihood,
            "confidence": confidence,
            "verdict": verdict,
            "raw_metrics": {
                "diff": float(diff),
                "std": float(std)
            }
        }
