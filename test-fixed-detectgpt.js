const fetch = require('node-fetch');

async function testFixedDetectGPT() {
  console.log('🔍 Testing Fixed DetectGPT Service...\n');

  const serviceUrl = 'https://simple-detectgpt-3mrk1v55n-madhuxx24-8951s-projects.vercel.app';
  
  // Test health endpoint
  console.log('1. Testing Health Endpoint...');
  try {
    const healthResponse = await fetch(`${serviceUrl}/api/detect`);
    console.log(`   Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`   ✅ Service Status: ${healthData.status}`);
      console.log(`   Service: ${healthData.service}`);
      console.log(`   Version: ${healthData.version}`);
      console.log(`   Method: ${healthData.method}`);
    } else {
      const errorText = await healthResponse.text();
      console.log(`   ❌ Health Check Failed: ${errorText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Health Check Error: ${error.message}`);
  }

  // Test root endpoint
  console.log('\n2. Testing Root Endpoint...');
  try {
    const rootResponse = await fetch(`${serviceUrl}/`);
    console.log(`   Status: ${rootResponse.status}`);
    
    if (rootResponse.ok) {
      console.log(`   ✅ Root endpoint accessible`);
    } else {
      console.log(`   ❌ Root endpoint failed: ${rootResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Root endpoint error: ${error.message}`);
  }

  // Test AI detection with POST
  console.log('\n3. Testing AI Detection...');
  const testText = "It is important to note that renewable energy represents a crucial component in addressing climate change. Furthermore, the implementation of sustainable technologies requires comprehensive analysis.";
  
  try {
    const detectResponse = await fetch(`${serviceUrl}/api/detect`, {
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
      console.log(`      Method: ${detectData.method}`);
      console.log(`      Word Count: ${detectData.wordCount}`);
      console.log(`      AI Markers: ${detectData.aiMarkerCount}`);
      console.log(`      Processing Time: ${detectData.processingTime}ms`);
    } else {
      const errorText = await detectResponse.text();
      console.log(`   ❌ Detection Failed: ${errorText.substring(0, 300)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Detection Error: ${error.message}`);
  }

  // Test human-like text
  console.log('\n4. Testing Human-like Text...');
  const humanText = "I really enjoyed working on this project! It was challenging at first, but I learned so much. The research part was my favorite.";
  
  try {
    const humanResponse = await fetch(`${serviceUrl}/api/detect`, {
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
      console.log(`   ✅ Human Text Analysis:`);
      console.log(`      AI Likelihood: ${humanData.aiLikelihood}%`);
      console.log(`      Confidence: ${humanData.confidence}`);
      console.log(`      Verdict: ${humanData.verdict}`);
      console.log(`      Has Personal Touch: ${humanData.hasPersonalTouch}`);
    } else {
      const errorText = await humanResponse.text();
      console.log(`   ❌ Human Text Failed: ${errorText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Human Text Error: ${error.message}`);
  }

  console.log('\n🎉 DetectGPT Service Test Complete!');
  console.log(`🔗 Service URL: ${serviceUrl}`);
  console.log(`🌐 Web Interface: ${serviceUrl}/`);
}

testFixedDetectGPT().catch(console.error);
