const fetch = require('node-fetch');

async function testDetectGPTLite() {
  console.log('🔍 Testing DetectGPT-Lite Service...\n');

  const serviceUrl = 'https://detectgpt-lite-4x637uvkv-madhuxx24-8951s-projects.vercel.app';
  
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

  // Test AI-like text
  console.log('\n2. Testing AI-like Text...');
  const aiText = "It is important to note that renewable energy represents a crucial component in addressing climate change. Furthermore, the implementation of sustainable technologies requires comprehensive analysis. In conclusion, the integration of these systems will facilitate optimal outcomes for environmental sustainability.";
  
  try {
    const aiResponse = await fetch(`${serviceUrl}/api/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: aiText
      })
    });
    
    console.log(`   Status: ${aiResponse.status}`);
    
    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      console.log(`   ✅ AI-like Text Analysis:`);
      console.log(`      AI Likelihood: ${aiData.aiLikelihood}%`);
      console.log(`      Human Likelihood: ${aiData.humanLikelihood}%`);
      console.log(`      Confidence: ${aiData.confidence}`);
      console.log(`      Verdict: ${aiData.verdict}`);
      console.log(`      Method: ${aiData.method}`);
      console.log(`      AI Patterns: ${aiData.raw_metrics.ai_patterns}`);
      console.log(`      Human Patterns: ${aiData.raw_metrics.human_patterns}`);
    } else {
      const errorText = await aiResponse.text();
      console.log(`   ❌ AI Text Analysis Failed: ${errorText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   ❌ AI Text Analysis Error: ${error.message}`);
  }

  // Test human-like text
  console.log('\n3. Testing Human-like Text...');
  const humanText = "I really enjoyed working on this project! It was challenging at first, but I learned so much. The research part was my favorite - I discovered some fascinating information. I can't wait to share my findings with the class.";
  
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
      console.log(`   ✅ Human-like Text Analysis:`);
      console.log(`      AI Likelihood: ${humanData.aiLikelihood}%`);
      console.log(`      Human Likelihood: ${humanData.humanLikelihood}%`);
      console.log(`      Confidence: ${humanData.confidence}`);
      console.log(`      Verdict: ${humanData.verdict}`);
      console.log(`      AI Patterns: ${humanData.raw_metrics.ai_patterns}`);
      console.log(`      Human Patterns: ${humanData.raw_metrics.human_patterns}`);
    } else {
      const errorText = await humanResponse.text();
      console.log(`   ❌ Human Text Analysis Failed: ${errorText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Human Text Analysis Error: ${error.message}`);
  }

  // Test mixed content
  console.log('\n4. Testing Mixed Content...');
  const mixedText = "This assignment challenged me to think more critically about the subject matter. It's important to note that I learned to analyze information from multiple perspectives. I really enjoyed developing stronger arguments through this process.";
  
  try {
    const mixedResponse = await fetch(`${serviceUrl}/api/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: mixedText
      })
    });
    
    if (mixedResponse.ok) {
      const mixedData = await mixedResponse.json();
      console.log(`   ✅ Mixed Content Analysis:`);
      console.log(`      AI Likelihood: ${mixedData.aiLikelihood}%`);
      console.log(`      Confidence: ${mixedData.confidence}`);
      console.log(`      Verdict: ${mixedData.verdict}`);
      console.log(`      Perplexity Score: ${Math.round(mixedData.raw_metrics.perplexity_score)}`);
      console.log(`      Structure Consistency: ${Math.round(mixedData.raw_metrics.structure_consistency * 100)}%`);
    }
  } catch (error) {
    console.log(`   ❌ Mixed Content Analysis Error: ${error.message}`);
  }

  console.log('\n🎉 DetectGPT-Lite Service Test Complete!');
  console.log('\n📋 Service is ready for integration with the main dashboard.');
  console.log(`🔗 Service URL: ${serviceUrl}`);
}

testDetectGPTLite().catch(console.error);
