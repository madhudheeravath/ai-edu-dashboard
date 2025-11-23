const fetch = require('node-fetch');

async function testHoneyBadger() {
  const serviceUrl = process.env.DETECTGPT_SERVICE_URL || 'https://simple-detectgpt-nw9l1dqh6-madhuxx24-8951s-projects.vercel.app';

  const text = `Honey badgers (also called ratels) are famous for being one of the toughest, most fearless animals in the world. Here’s what makes them special:

1. Extreme Fearlessness

They attack animals much larger than themselves — even lions, hyenas, and wild dogs. They don’t back down easily and will fight aggressively when threatened.

2. Very Intelligent

Honey badgers can:

- Use tools (rare in the wild)
- Escape locked enclosures
- Solve puzzles

Their problem-solving ability is unusually high for their size.

3. Thick, Tough Skin

They have:
- Skin that is loose and rubbery, making it hard for predators to grip
- High resistance to bites, stings, and scratches
- Even bee stings, porcupine quills, and snake bites don’t affect them much.

4. Resistance to Snake Venom

Honey badgers can survive bites from highly venomous snakes like cobras. Even if they pass out from the venom, they often wake up again and continue moving.

5. Strong Digging Skills

They have powerful claws and can dig quickly to find food, escape danger, or create burrows.

In summary, honey badgers are fearless, smart, and incredibly tough—traits that make them one of the most impressive animals in the animal kingdom.`;

  console.log('🔍 Testing Honey Badger text...');
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

testHoneyBadger().catch(console.error);
