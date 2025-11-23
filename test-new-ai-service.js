const fetch = require('node-fetch');

async function testNewAIService() {
  console.log('🔍 Testing New AI Detection Service...\n');

  const serviceUrl = 'https://ai-detection-server-9le2wi3l0-madhuxx24-8951s-projects.vercel.app';
  
  // Test health endpoint
  console.log('1. Testing Health Endpoint...');
  try {
    const healthResponse = await fetch(`${serviceUrl}/api/health`);
    console.log(`   Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`   ✅ Service Status: ${healthData.status}`);
      console.log(`   Version: ${healthData.version}`);
      console.log(`   Environment: ${healthData.environment}`);
    } else {
      const errorText = await healthResponse.text();
      console.log(`   ❌ Health Check Failed: ${errorText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Health Check Error: ${error.message}`);
  }

  // Test simple-detect endpoint
  console.log('\n2. Testing Simple Detect Endpoint...');
  const testText = "This assignment challenged me to think more critically about the subject matter. I learned to analyze information from multiple perspectives and develop stronger arguments. It's important to note that this process was quite enlightening.";
  
  try {
    const detectResponse = await fetch(`${serviceUrl}/api/simple-detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: testText
      })
    });
    
    console.log(`   Status: ${detectResponse.status}`);
    
    if (detectResponse.ok) {
      const detectData = await detectResponse.json();
      console.log(`   ✅ AI Detection Working:`);
      console.log(`      AI Likelihood: ${detectData.aiLikelihood}%`);
      console.log(`      Human Likelihood: ${detectData.humanLikelihood}%`);
      console.log(`      Confidence: ${detectData.confidence}`);
      console.log(`      Verdict: ${detectData.verdict}`);
      console.log(`      Word Count: ${detectData.wordCount}`);
      console.log(`      Has AI Markers: ${detectData.hasAIMarkers}`);
      console.log(`      Has Personal Touch: ${detectData.hasPersonalTouch}`);
      console.log(`      Formality Level: ${detectData.formalityLevel}`);
      console.log(`      Processing Time: ${detectData.processingTime}ms`);
      console.log(`      Detection Method: ${detectData.detectionMethod}`);
    } else {
      const errorText = await detectResponse.text();
      console.log(`   ❌ Detection Failed: ${errorText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Detection Error: ${error.message}`);
  }

  // Test with AI-like text
  console.log('\n3. Testing with AI-like Text...');
  const aiText = "It is important to note that renewable energy represents a crucial component in addressing climate change. Furthermore, the implementation of sustainable technologies requires comprehensive analysis. In conclusion, the integration of these systems will facilitate optimal outcomes for environmental sustainability.";
  
  try {
    const aiResponse = await fetch(`${serviceUrl}/api/simple-detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: aiText
      })
    });
    
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      console.log(`   ✅ AI-like Text Analysis:`);
      console.log(`      AI Likelihood: ${aiData.aiLikelihood}%`);
      console.log(`      Confidence: ${aiData.confidence}`);
      console.log(`      Verdict: ${aiData.verdict}`);
      console.log(`      AI Markers: ${aiData.aiMarkerCount}`);
    }
  } catch (error) {
    console.log(`   ❌ AI Text Analysis Error: ${error.message}`);
  }

  // Test with human-like text
  console.log('\n4. Testing with Human-like Text...');
  const humanText = "I really enjoyed working on this project! It was challenging at first, but I learned so much. The research part was my favorite - I discovered some fascinating information. I can't wait to share my findings with the class.";
  
  try {
    const humanResponse = await fetch(`${serviceUrl}/api/simple-detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: humanText
      })
    });
    
    if (humanResponse.ok) {
      const humanData = await humanResponse.json();
      console.log(`   ✅ Human-like Text Analysis:`);
      console.log(`      AI Likelihood: ${humanData.aiLikelihood}%`);
      console.log(`      Confidence: ${humanData.confidence}`);
      console.log(`      Verdict: ${humanData.verdict}`);
      console.log(`      Personal Touch: ${humanData.hasPersonalTouch}`);
    }
  } catch (error) {
    console.log(`   ❌ Human Text Analysis Error: ${error.message}`);
  }

  console.log('\n🎉 AI Detection Service Test Complete!');
  console.log('\n📋 Service is now ready for integration with the main dashboard.');
}

testNewAIService().catch(console.error);
