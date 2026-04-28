export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, imageMime, dirVal, spdCount } = req.body;
  if (!imageBase64 || !dirVal || !spdCount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: imageMime, data: imageBase64 } },
            { type: 'text', text: `Identify the main object in this image. Write a single AI video generation prompt in English: the object as a high-quality 3D model, ${dirVal}, completing exactly ${spdCount} full rotation${spdCount > 1 ? 's' : ''}, clean studio background, dramatic lighting, smooth animation. Return ONLY the prompt text, nothing else.` }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.map(i => i.text || '').join('').trim();
    return res.status(200).json({ result: text });
  } catch (e) {
    return res.status(500).json({ error: 'API call failed' });
  }
}
