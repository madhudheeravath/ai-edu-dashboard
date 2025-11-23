const fetch = require('node-fetch');

async function testAIServiceConnection() {
  console.log('🔍 Testing AI Detection Service Connection...\n');

  const serviceUrl = 'https://ai-detection-server-l8yavla6h-madhuxx24-8951s-projects.vercel.app';
  
  // Test health endpoint
  console.log('1. Testing Health Endpoint...');
  try {
    const healthResponse = await fetch(`${serviceUrl}/api/health`);
    console.log(`   Status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`   ✅ Service Status: ${healthData.status}`);
      console.log(`   Version: ${healthData.version}`);
      console.log(`   Uptime: ${Math.round(healthData.uptime)}s`);
    } else {
      const errorText = await healthResponse.text();
      console.log(`   ❌ Health Check Failed: ${errorText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Health Check Error: ${error.message}`);
  }

  // Test detect endpoint
  console.log('\n2. Testing Detect Endpoint...');
  const testText = "This is a test text to analyze for AI detection. It contains various patterns and structures that should be analyzed properly.";
  
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
      console.log(`      Confidence: ${detectData.confidence}`);
      console.log(`      Verdict: ${detectData.verdict}`);
      console.log(`      Processing Time: ${detectData.processingTime}ms`);
    } else {
      const errorText = await detectResponse.text();
      console.log(`   ❌ Detection Failed: ${errorText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Detection Error: ${error.message}`);
  }

  // Test main dashboard integration
  console.log('\n3. Testing Main Dashboard Integration...');
  try {
    const dashboardResponse = await fetch('https://ai-edu-dashboard-sigma.vercel.app/api/detect-ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: testText
      })
    });
    
    console.log(`   Status: ${dashboardResponse.status}`);
    
    if (dashboardResponse.status === 401) {
      console.log(`   ⚠️  Expected 401 (Unauthorized) - needs valid session`);
    } else if (dashboardResponse.ok) {
      const dashboardData = await dashboardResponse.json();
      console.log(`   ✅ Dashboard Integration Working:`);
      console.log(`      Detection Method: ${dashboardData.detectionMethod}`);
    } else {
      const errorText = await dashboardResponse.text();
      console.log(`   ❌ Dashboard Integration Failed: ${errorText.substring(0, 200)}...`);
    }
  } catch (error) {
    console.log(`   ❌ Dashboard Integration Error: ${error.message}`);
  }

  console.log('\n📋 Diagnosis Complete!');
}

testAIServiceConnection().catch(console.error);
