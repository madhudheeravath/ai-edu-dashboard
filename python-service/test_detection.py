#!/usr/bin/env python3
"""
Test script for DetectGPT detection
"""
import requests
import json

# Test texts
AI_GENERATED_TEXT = """
Artificial intelligence represents a transformative paradigm in modern education. 
It is important to note that AI systems can facilitate personalized learning 
experiences through adaptive algorithms. Moreover, these technologies enable 
educators to leverage data-driven insights for enhanced pedagogical outcomes. 
The integration of AI in educational settings has profound implications for 
student engagement and learning efficacy. Furthermore, it is essential to 
recognize that these advancements necessitate careful consideration of ethical 
frameworks and pedagogical best practices.
"""

HUMAN_WRITTEN_TEXT = """
I think AI is pretty cool but also kinda scary lol. Like, it can help with 
homework but what if I rely on it too much? I'm trying to balance using it 
for ideas vs doing my own thinking. Not sure if I'm doing this right tbh. 
Sometimes I write stuff and then check with AI to see if it makes sense. 
My teacher says that's okay as long as I'm learning from it. But I wonder 
if other students are just copying AI answers without understanding them. 
That seems wrong to me. I want to actually learn the material, not just 
get good grades. What do you think?
"""

def test_detection(text, label):
    print(f"\n{'='*60}")
    print(f"Testing: {label}")
    print(f"{'='*60}")
    print(f"Text preview: {text[:100]}...")
    
    try:
        response = requests.post(
            "http://localhost:8000/detect",
            json={"text": text},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ Success!")
            print(f"   AI Likelihood: {result['aiLikelihood']}%")
            print(f"   Human Likelihood: {result['humanLikelihood']}%")
            print(f"   Confidence: {result['confidence']}")
            print(f"   Verdict: {result['verdict']}")
            print(f"   Score: {result['score']:.3f}")
            print(f"   Method: {result['method']}")
            
            # Validate result
            if label == "AI-Generated":
                if result['aiLikelihood'] > 60:
                    print(f"   ✅ Correctly detected as AI-generated")
                else:
                    print(f"   ⚠️  Low AI likelihood - may need tuning")
            else:
                if result['humanLikelihood'] > 60:
                    print(f"   ✅ Correctly detected as human-written")
                else:
                    print(f"   ⚠️  Low human likelihood - may need tuning")
        else:
            print(f"\n❌ Error: {response.status_code}")
            print(f"   {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"\n❌ Connection Error!")
        print(f"   Is the DetectGPT service running on http://localhost:8000?")
        print(f"   Start it with: python main.py")
    except requests.exceptions.Timeout:
        print(f"\n❌ Timeout!")
        print(f"   Detection took too long (>30s)")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

def check_health():
    print("\n" + "="*60)
    print("Checking DetectGPT Service Health")
    print("="*60)
    
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Service is running!")
            print(f"   Status: {data['status']}")
            print(f"   Device: {data['device']}")
            print(f"   Model: {data['model']}")
            print(f"   Version: {data['version']}")
            return True
        else:
            print(f"❌ Service returned: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to service!")
        print(f"   Make sure DetectGPT is running on http://localhost:8000")
        print(f"   Start it with: python main.py")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print("\n🔬 DetectGPT Test Suite")
    
    # Check if service is running
    if not check_health():
        print("\n⚠️  Please start the DetectGPT service first!")
        print("   Run: python main.py")
        exit(1)
    
    # Test AI-generated text
    test_detection(AI_GENERATED_TEXT, "AI-Generated")
    
    # Test human-written text
    test_detection(HUMAN_WRITTEN_TEXT, "Human-Written")
    
    print(f"\n{'='*60}")
    print("✅ Tests Complete!")
    print(f"{'='*60}\n")
    
    print("Next steps:")
    print("1. If results look good, the service is working correctly!")
    print("2. Try it in your Next.js app by submitting an assignment")
    print("3. Look for the 🔬 DetectGPT badge in the analysis results")
    print("4. Compare with 📊 Heuristic method (stop Python service)")
