const fetch = require('node-fetch');

async function testAggressiveDetection() {
  console.log('🔍 Testing Aggressive AI Detection Algorithm...\n');

  const serviceUrl = 'https://simple-detectgpt-knvuouj0r-madhuxx24-8951s-projects.vercel.app';
  
  // Test with the same text that ZeroGPT detected as 100% AI
  console.log('1. Testing AI-Generated Text (should be high AI likelihood)...');
  const aiText = `HP Inc. (HP) is a long-standing American information-technology company that traces its roots back to Hewlett-Packard Company, founded in 1939 by Bill Hewlett and David Packard in a garage in Palo Alto, California. Over the decades HP grew into a global pioneer in electronics, instrumentation, personal computing and printing. In 2015, the original Hewlett-Packard Company split into two publicly traded entities: one retaining the PC/printer business as HP Inc., and the other, Hewlett Packard Enterprise, focused on enterprise hardware and services. In its current form, HP Inc. concentrates on personal computing devices (laptops, desktops), printing and imaging systems (including both consumer and commercial printers), and emerging fields like 3D printing.`;
  
  try {
    const response = await fetch(`${serviceUrl}/api/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: aiText })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ AI Text Analysis:`);
      console.log(`      AI Likelihood: ${data.aiLikelihood}%`);
      console.log(`      Human Likelihood: ${data.humanLikelihood}%`);
      console.log(`      Confidence: ${data.confidence}`);
      console.log(`      Verdict: ${data.verdict}`);
      console.log(`      Word Count: ${data.wordCount}`);
      console.log(`      AI Markers: ${data.aiMarkerCount}`);
      console.log(`      Has Personal Touch: ${data.hasPersonalTouch}`);
      console.log(`      Formality Level: ${data.formalityLevel}`);
      
      if (data.aiLikelihood >= 70) {
        console.log(`   🎯 SUCCESS: High AI likelihood detected (${data.aiLikelihood}%)`);
      } else if (data.aiLikelihood >= 50) {
        console.log(`   ⚠️  MODERATE: Medium AI likelihood (${data.aiLikelihood}%)`);
      } else {
        console.log(`   ❌ FAILED: Low AI likelihood (${data.aiLikelihood}%) - should be higher`);
      }
    } else {
      console.log(`   ❌ Test Failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Test Error: ${error.message}`);
  }

  // Test with clearly human text
  console.log('\n2. Testing Human-Written Text (should be low AI likelihood)...');
  const humanText = `I really enjoyed working on this project! It was challenging at first, but I learned so much. The research part was my favorite - I discovered some fascinating information. I can't wait to share my findings with the class. Honestly, this assignment helped me understand the topic way better than just reading about it.`;
  
  try {
    const response = await fetch(`${serviceUrl}/api/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: humanText })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Human Text Analysis:`);
      console.log(`      AI Likelihood: ${data.aiLikelihood}%`);
      console.log(`      Human Likelihood: ${data.humanLikelihood}%`);
      console.log(`      Confidence: ${data.confidence}`);
      console.log(`      Verdict: ${data.verdict}`);
      console.log(`      Has Personal Touch: ${data.hasPersonalTouch}`);
      console.log(`      AI Markers: ${data.aiMarkerCount}`);
      
      if (data.aiLikelihood <= 30) {
        console.log(`   🎯 SUCCESS: Low AI likelihood detected (${data.aiLikelihood}%)`);
      } else if (data.aiLikelihood <= 50) {
        console.log(`   ⚠️  MODERATE: Medium AI likelihood (${data.aiLikelihood}%)`);
      } else {
        console.log(`   ❌ FAILED: High AI likelihood (${data.aiLikelihood}%) - should be lower`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Test Error: ${error.message}`);
  }

  // Test with academic/formal text (often AI-generated)
  console.log('\n3. Testing Academic/Formal Text (likely AI)...');
  const academicText = `It is important to note that effective research methodology requires comprehensive analysis of multiple variables. Furthermore, the implementation of systematic approaches facilitates optimal outcomes. The theoretical framework demonstrates significant correlation between variables, thus establishing a robust foundation for empirical investigation.`;
  
  try {
    const response = await fetch(`${serviceUrl}/api/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: academicText })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Academic Text Analysis:`);
      console.log(`      AI Likelihood: ${data.aiLikelihood}%`);
      console.log(`      Confidence: ${data.confidence}`);
      console.log(`      Verdict: ${data.verdict}`);
      console.log(`      AI Markers: ${data.aiMarkerCount}`);
      console.log(`      Formality Level: ${data.formalityLevel}`);
    }
  } catch (error) {
    console.log(`   ❌ Test Error: ${error.message}`);
  }

  console.log('\n🎉 Aggressive Detection Test Complete!');
  console.log('\n📊 Algorithm Improvements:');
  console.log('✅ More aggressive scoring (starts at 50% baseline)');
  console.log('✅ Enhanced formal language detection');
  console.log('✅ Academic jargon recognition');
  console.log('✅ Generic template phrase detection');
  console.log('✅ Repetitive structure analysis');
  console.log('✅ Strong penalties for human indicators');
  console.log('\n🔗 Service URL:', serviceUrl);
}

testAggressiveDetection().catch(console.error);
