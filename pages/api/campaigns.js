export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { accountId, datePreset } = req.query;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!accessToken) {
    return res.status(500).json({ error: 'META_ACCESS_TOKEN not configured' });
  }

  if (!accountId) {
    return res.status(400).json({ error: 'accountId is required' });
  }

  const preset = datePreset || 'last_7d';

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,insights.date_preset(${preset}){spend,impressions,clicks,ctr,cpc,cpm,cpp,actions,action_values,frequency,reach}&access_token=${accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
