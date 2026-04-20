# Meta Ads Dashboard

A professional dashboard for analyzing Meta (Facebook) ad campaign performance with integrated Claude AI strategic analysis.

Built for **GSD Works** by Claude.

## Features

- 📊 Real-time Meta Ads campaign performance tracking
- 🤖 Claude AI-powered strategic analysis and recommendations
- 📈 Key metrics: ROAS, CTR, CPA, conversions, spend
- 📅 7-day and 30-day performance views
- 📥 CSV export functionality
- 🎯 Campaign-level and overall account analysis

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts
- **Backend**: Next.js API Routes
- **APIs**: Meta Marketing API, Anthropic Claude API
- **Deployment**: Vercel (recommended)

## Prerequisites

1. **Meta Access Token**: Get from [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. **Anthropic API Key**: Get from [Anthropic Console](https://console.anthropic.com/)
3. **Node.js**: Version 18 or higher
4. **GitHub Account**: For deploying to Vercel
5. **Vercel Account**: Free tier works perfectly

## Quick Start - Deploy to Vercel (Recommended)

### Step 1: Get Your API Keys

**Meta Access Token:**
1. Go to https://developers.facebook.com/tools/explorer/
2. Select your "Dashboard" app
3. Click "Generate Access Token"
4. Add permissions: `ads_read`, `ads_management`, `business_management`
5. Go to https://developers.facebook.com/tools/debug/accesstoken/
6. Paste token and click "Extend Access Token"
7. Copy the extended token (lasts 60 days)

**Anthropic API Key:**
1. Go to https://console.anthropic.com/
2. Create an account or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-ant-...`)

### Step 2: Deploy to Vercel

1. **Push code to GitHub:**
   ```bash
   cd meta-ads-dashboard
   git init
   git add .
   git commit -m "Initial commit: Meta Ads Dashboard"
   gh repo create meta-ads-dashboard --private --source=. --push
   ```
   
   (Or create a new repo on GitHub.com and push manually)

2. **Connect to Vercel:**
   - Go to https://vercel.com/
   - Click "Add New" → "Project"
   - Import your `meta-ads-dashboard` repository
   - Click "Deploy"

3. **Add Environment Variables in Vercel:**
   - Go to your project settings
   - Click "Environment Variables"
   - Add these two variables:
     - `META_ACCESS_TOKEN`: Your extended Meta token
     - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - Click "Save"

4. **Redeploy:**
   - Go to "Deployments" tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"

5. **Done!** Your dashboard is live at `https://your-project-name.vercel.app`

## Local Development

If you want to run it locally first:

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and add your API keys
# META_ACCESS_TOKEN=your_token_here
# ANTHROPIC_API_KEY=your_key_here

# Run development server
npm run dev

# Open http://localhost:3000
```

## Usage

1. **View Overall Performance**: Dashboard loads with 7-day metrics by default
2. **Switch Date Ranges**: Toggle between 7-day and 30-day views
3. **Analyze Overall**: Click "Analyze Overall Performance" for Claude's strategic assessment
4. **Analyze Individual Campaigns**: Click "Analyze" on any campaign for specific recommendations
5. **Export Data**: Click "Export CSV" to download campaign data

## Security Notes

- Never commit your `.env` file
- Rotate your Meta access token every 60 days
- Keep your Anthropic API key secure
- Use environment variables in Vercel, never hardcode keys

## Troubleshooting

**"META_ACCESS_TOKEN not configured" error:**
- Make sure you added the environment variable in Vercel
- Redeploy after adding environment variables

**"Failed to fetch campaigns" error:**
- Check that your Meta token hasn't expired
- Verify you selected the correct business in the Meta app setup
- Make sure the token has the right permissions

**Claude analysis not working:**
- Verify your ANTHROPIC_API_KEY is set correctly
- Check you have API credits in your Anthropic account

## Extending This App

Want to add more features? Here are some ideas:

- **Multiple Clients**: Modify to handle multiple ad accounts
- **Ad Creative Preview**: Pull in ad images and copy
- **Automated Alerts**: Email notifications for underperforming campaigns
- **Historical Trends**: Store data over time for trend analysis
- **Budget Optimizer**: Claude-powered budget allocation recommendations

## Support

Built by Claude AI for Grant @ GSD Works.

For issues or questions, reference this README or ask Claude directly.

## License

ISC - Use it however you want.
