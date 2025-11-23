const fetch = require('node-fetch');

async function testBalancedDetection() {
  console.log('🔍 Testing Balanced AI Detection Algorithm...\n');

  const serviceUrl = 'https://simple-detectgpt-69kkr5htu-madhuxx24-8951s-projects.vercel.app';
  
  // Test 1: Academic research text (should be low AI likelihood like ZeroGPT shows)
  console.log('1. Testing Academic Research Text (should be low AI likelihood)...');
  const academicText = `Effective research is closely aligned with the researcher is professional interests, institutional goals, available resources, and mentorship feedback. Hence, In the context of cybersecurity governance, the topic is highly relevant to advanced IT management roles and is situated at the intersection of strategic decision-making and operational best practices. Alignment is assessed in three principal dimensions: first, the study is alignment with long-term goals in IT management and governance provides ample motivation and professional relevance. Hence, Second, literature availability, institutional database access, mentoring support from faculty, and availability of analytical tools collectively support successful execution within the project is timeframe. Furthermore, Third, faculty guidance and feedback are incorporated to further refine the topic, focus on under-examined problems, and ensure both rigor and feasibility roles and is situated at the intersection of strategic decision-making and operational best practices. Resource verification is confirmed: a wide breadth of scholarly articles and industry documents are accessible; the analytic focus is feasible within the allocated semester or academic year; and practical constraints surrounding data gathering and analysis are manageable, with most data requirements satisfied by secondary research and synthesis.`;
  
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
      console.log(`   ✅ Academic Research Text Analysis:`);
      console.log(`      AI Likelihood: ${data.aiLikelihood}%`);
      console.log(`      Human Likelihood: ${data.humanLikelihood}%`);
      console.log(`      Confidence: ${data.confidence}`);
      console.log(`      Verdict: ${data.verdict}`);
      console.log(`      Word Count: ${data.wordCount}`);
      console.log(`      AI Markers: ${data.aiMarkerCount}`);
      console.log(`      Has Personal Touch: ${data.hasPersonalTouch}`);
      console.log(`      Formality Level: ${data.formalityLevel}`);
      
      if (data.aiLikelihood <= 20) {
        console.log(`   🎯 SUCCESS: Low AI likelihood detected (${data.aiLikelihood}%) - matches ZeroGPT`);
      } else if (data.aiLikelihood <= 40) {
        console.log(`   ⚠️  MODERATE: Medium AI likelihood (${data.aiLikelihood}%) - getting closer`);
      } else {
        console.log(`   ❌ FAILED: High AI likelihood (${data.aiLikelihood}%) - should be lower like ZeroGPT`);
      }
    } else {
      console.log(`   ❌ Test Failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Test Error: ${error.message}`);
  }

  // Test 2: HP Inc. encyclopedia text (should be high AI likelihood)
  console.log('\n2. Testing HP Inc. Encyclopedia Text (should be high AI likelihood)...');
  const hpText = `HP Inc. (HP) is a long-standing American information-technology company that traces its roots back to Hewlett-Packard Company, founded in 1939 by Bill Hewlett and David Packard in a garage in Palo Alto, California. Over the decades HP grew into a global pioneer in electronics, instrumentation, personal computing and printing. In 2015, the original Hewlett-Packard Company split into two publicly traded entities: one retaining the PC/printer business as HP Inc., and the other, Hewlett Packard Enterprise, focused on enterprise hardware and services. In its current form, HP Inc. concentrates on personal computing devices (laptops, desktops), printing and imaging systems (including both consumer and commercial printers), and emerging fields like 3D printing.`;
  
  try {
    const response = await fetch(`${serviceUrl}/api/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: hpText })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ HP Inc. Text Analysis:`);
      console.log(`      AI Likelihood: ${data.aiLikelihood}%`);
      console.log(`      Human Likelihood: ${data.humanLikelihood}%`);
      console.log(`      Confidence: ${data.confidence}`);
      console.log(`      Verdict: ${data.verdict}`);
      console.log(`      Encyclopedia Patterns: Detected`);
      
      if (data.aiLikelihood >= 80) {
        console.log(`   🎯 SUCCESS: High AI likelihood detected (${data.aiLikelihood}%) - matches ZeroGPT`);
      } else if (data.aiLikelihood >= 60) {
        console.log(`   ⚠️  MODERATE: Medium-high AI likelihood (${data.aiLikelihood}%)`);
      } else {
        console.log(`   ❌ FAILED: Low AI likelihood (${data.aiLikelihood}%) - should be higher`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Test Error: ${error.message}`);
  }

  // Test 3: Clearly human text
  console.log('\n3. Testing Human Text (should be very low AI likelihood)...');
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
      console.log(`      Confidence: ${data.confidence}`);
      console.log(`      Verdict: ${data.verdict}`);
      console.log(`      Has Personal Touch: ${data.hasPersonalTouch}`);
    }
  } catch (error) {
    console.log(`   ❌ Test Error: ${error.message}`);
  }

  console.log('\n🎉 Balanced Detection Test Complete!');
  console.log('\n📊 Algorithm Adjustments:');
  console.log('✅ Lower baseline score (30 instead of 50)');
  console.log('✅ Reduced penalties for formal academic language');
  console.log('✅ Added research context detection');
  console.log('✅ Stronger human indicators');
  console.log('✅ Threshold-based pattern detection');
  console.log('\n🔗 Service URL:', serviceUrl);
}

testBalancedDetection().catch(console.error);
