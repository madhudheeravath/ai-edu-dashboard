const fetch = require('node-fetch');

async function testRoomHeaters() {
  const serviceUrl = process.env.DETECTGPT_SERVICE_URL || 'https://simple-detectgpt-69kkr5htu-madhuxx24-8951s-projects.vercel.app';

  const text = `Room heaters are compact appliances designed to warm up indoor spaces by converting electrical energy (or fuel) into heat. They are especially useful during winter months when central heating is insufficient or unavailable. Most household heaters are electric and portable, making them convenient to move from room to room. Their main purpose is to provide quick, localized warmth without needing to heat the entire house.

There are several types of room heaters, each working differently. Fan heaters blow air over a heated coil to warm the room quickly. Quartz/halogen heaters use infrared heating tubes that warm objects and people directly, similar to sunlight. Oil-filled radiators (OFR) heat oil inside sealed fins and release slow, steady warmth—excellent for long hours and safer for children. Convector heaters warm air and circulate it naturally without a fan, making them quieter.

When choosing a room heater, you should consider room size, electricity usage, noise, safety features, and heating speed. Small rooms benefit from fan or quartz heaters, while oil-filled radiators are ideal for bedrooms or continuous nighttime use because they retain heat and remain silent. Look for features like tip-over protection, thermostat control, and overheat safety. Room heaters can increase electricity bills, so using them at controlled temperatures and proper insulation helps save energy.`;

  console.log('🔍 Testing Room Heaters text...');
  console.log('Service URL:', serviceUrl);

  const response = await fetch(`${serviceUrl}/api/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  console.log('Status:', response.status);
  const data = await response.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

testRoomHeaters().catch(console.error);
