'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('last_7d');
  const [adAccounts, setAdAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [insights, setInsights] = useState(null);
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchAdAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchCampaignData();
    }
  }, [selectedAccount, dateRange]);

  const fetchAdAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/accounts');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setAdAccounts(data.data || []);
      
      if (data.data && data.data.length > 0) {
        setSelectedAccount(data.data[0].id);
      }
    } catch (err) {
      setError(`Failed to fetch ad accounts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignData = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/campaigns?accountId=${selectedAccount}&datePreset=${dateRange}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setCampaigns(data.data || []);
      
      // Calculate overall insights
      const allInsights = (data.data || []).reduce((acc, campaign) => {
        if (campaign.insights && campaign.insights.data && campaign.insights.data[0]) {
          const insight = campaign.insights.data[0];
          acc.spend += parseFloat(insight.spend || 0);
          acc.impressions += parseInt(insight.impressions || 0);
          acc.clicks += parseInt(insight.clicks || 0);
          acc.reach += parseInt(insight.reach || 0);
          
          if (insight.actions) {
            const purchases = insight.actions.find(a => a.action_type === 'purchase' || a.action_type === 'omni_purchase');
            if (purchases) {
              acc.conversions += parseInt(purchases.value || 0);
            }
          }
          
          if (insight.action_values) {
            const purchaseValue = insight.action_values.find(a => a.action_type === 'purchase' || a.action_type === 'omni_purchase');
            if (purchaseValue) {
              acc.conversionValue += parseFloat(purchaseValue.value || 0);
            }
          }
        }
        return acc;
      }, { spend: 0, impressions: 0, clicks: 0, reach: 0, conversions: 0, conversionValue: 0 });
      
      allInsights.ctr = allInsights.impressions > 0 ? (allInsights.clicks / allInsights.impressions * 100) : 0;
      allInsights.cpc = allInsights.clicks > 0 ? (allInsights.spend / allInsights.clicks) : 0;
      allInsights.cpa = allInsights.conversions > 0 ? (allInsights.spend / allInsights.conversions) : 0;
      allInsights.roas = allInsights.spend > 0 ? (allInsights.conversionValue / allInsights.spend) : 0;
      
      setInsights(allInsights);
      
    } catch (err) {
      setError(`Failed to fetch campaigns: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const analyzeOverall = async () => {
    if (!insights) return;
    
    setAnalyzing(true);
    setAnalysis(null);
    
    const context = `You are a Meta Ads expert analyzing performance data for Eye Books, a book publisher.

Overall Account Performance (${dateRange === 'last_7d' ? 'Last 7 days' : 'Last 30 days'}):
- Total Spend: $${insights.spend.toFixed(2)}
- ROAS: ${insights.roas.toFixed(2)}x
- Conversions: ${insights.conversions}
- Conversion Value: $${insights.conversionValue.toFixed(2)}
- CPA: $${insights.cpa.toFixed(2)}
- CTR: ${insights.ctr.toFixed(2)}%
- Total Clicks: ${insights.clicks.toLocaleString()}
- Total Impressions: ${insights.impressions.toLocaleString()}

Active Campaigns: ${campaigns.filter(c => c.status === 'ACTIVE').length}
Total Campaigns: ${campaigns.length}

Provide a strategic analysis covering:
1. **Performance Assessment**: What's working well and what's not
2. **Key Issues**: Identify any red flags (high CPA, low CTR, creative fatigue, etc.)
3. **Actionable Recommendations**: Specific tactics to improve ROAS
4. **Budget Optimization**: Where to allocate spend

Be direct, specific, and focus on making these ads more profitable.`;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: context })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setAnalysis(`Error analyzing data: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const analyzeCampaign = async (campaign) => {
    const insight = campaign.insights?.data?.[0];
    if (!insight) return;
    
    setAnalyzing(true);
    setAnalysis(null);
    
    const purchases = insight.actions?.find(a => a.action_type === 'purchase' || a.action_type === 'omni_purchase');
    const purchaseValue = insight.action_values?.find(a => a.action_type === 'purchase' || a.action_type === 'omni_purchase');
    
    const context = `You are a Meta Ads expert analyzing performance data for Eye Books.

Campaign: ${campaign.name}
Status: ${campaign.status}
Objective: ${campaign.objective}

Performance (${dateRange === 'last_7d' ? 'Last 7 days' : 'Last 30 days'}):
- Spend: $${parseFloat(insight.spend || 0).toFixed(2)}
- Impressions: ${parseInt(insight.impressions || 0).toLocaleString()}
- Clicks: ${parseInt(insight.clicks || 0).toLocaleString()}
- CTR: ${parseFloat(insight.ctr || 0).toFixed(2)}%
- CPC: $${parseFloat(insight.cpc || 0).toFixed(2)}
- CPM: $${parseFloat(insight.cpm || 0).toFixed(2)}
- Frequency: ${parseFloat(insight.frequency || 0).toFixed(2)}
- Conversions: ${purchases?.value || 0}
- Conversion Value: $${purchaseValue?.value || 0}
${purchaseValue?.value && insight.spend ? `- ROAS: ${(parseFloat(purchaseValue.value) / parseFloat(insight.spend)).toFixed(2)}x` : ''}

Analyze this campaign and provide:
1. Performance verdict (is this working or not?)
2. Specific issues to address
3. Concrete recommendations to improve results

Be direct and actionable.`;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: context })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setAnalysis(`Error analyzing campaign: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const exportData = () => {
    const csvData = campaigns.map(campaign => {
      const insight = campaign.insights?.data?.[0];
      if (!insight) return null;
      
      const purchases = insight.actions?.find(a => a.action_type === 'purchase' || a.action_type === 'omni_purchase');
      const purchaseValue = insight.action_values?.find(a => a.action_type === 'purchase' || a.action_type === 'omni_purchase');
      
      return {
        Campaign: campaign.name,
        Status: campaign.status,
        Spend: insight.spend || 0,
        Impressions: insight.impressions || 0,
        Clicks: insight.clicks || 0,
        CTR: insight.ctr || 0,
        CPC: insight.cpc || 0,
        CPM: insight.cpm || 0,
        Frequency: insight.frequency || 0,
        Conversions: purchases?.value || 0,
        'Conversion Value': purchaseValue?.value || 0,
        ROAS: purchaseValue?.value && insight.spend ? (parseFloat(purchaseValue.value) / parseFloat(insight.spend)).toFixed(2) : 0
      };
    }).filter(Boolean);

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eye-books-ads-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatCurrency = (value) => `$${parseFloat(value || 0).toFixed(2)}`;
  const formatNumber = (value) => parseInt(value || 0).toLocaleString();
  const formatPercent = (value) => `${parseFloat(value || 0).toFixed(2)}%`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meta Ads Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Eye Books Performance Analytics</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="last_7d">Last 7 Days</option>
                <option value="last_30d">Last 30 Days</option>
              </select>
              
              <button
                onClick={fetchCampaignData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 text-sm font-medium"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              
              <button
                onClick={exportData}
                disabled={!campaigns.length}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 text-sm font-medium"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {loading && !insights ? (
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Loading campaign data...</p>
        </div>
      ) : insights ? (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Spend</h3>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(insights.spend)}</p>
              <p className="text-xs text-gray-500 mt-1">{dateRange === 'last_7d' ? 'Last 7 days' : 'Last 30 days'}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">ROAS</h3>
              <p className={`text-2xl font-bold ${insights.roas >= 2 ? 'text-green-600' : 'text-red-600'}`}>
                {insights.roas.toFixed(2)}x
              </p>
              <p className="text-xs text-gray-500 mt-1">{formatCurrency(insights.conversionValue)} revenue</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Conversions</h3>
              <p className="text-2xl font-bold text-gray-900">{insights.conversions}</p>
              <p className="text-xs text-gray-500 mt-1">CPA: {formatCurrency(insights.cpa)}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">CTR</h3>
              <p className="text-2xl font-bold text-gray-900">{formatPercent(insights.ctr)}</p>
              <p className="text-xs text-gray-500 mt-1">{formatNumber(insights.clicks)} clicks</p>
            </div>
          </div>

          {/* Claude Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Claude AI Analysis</h2>
              <button
                onClick={analyzeOverall}
                disabled={analyzing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 text-sm font-medium"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Overall Performance'}
              </button>
            </div>
            
            {analyzing && (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">Claude is analyzing your data...</p>
              </div>
            )}
            
            {analysis && !analyzing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 whitespace-pre-wrap text-sm text-gray-800">
                {analysis}
              </div>
            )}
            
            {!analysis && !analyzing && (
              <p className="text-sm text-gray-500 text-center py-8">
                Click "Analyze Overall Performance" to get strategic insights from Claude
              </p>
            )}
          </div>

          {/* Campaigns */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Campaigns</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {campaigns.map(campaign => {
                const insight = campaign.insights?.data?.[0];
                if (!insight) return null;
                
                const purchases = insight.actions?.find(a => a.action_type === 'purchase' || a.action_type === 'omni_purchase');
                const purchaseValue = insight.action_values?.find(a => a.action_type === 'purchase' || a.action_type === 'omni_purchase');
                const roas = purchaseValue?.value && insight.spend ? (parseFloat(purchaseValue.value) / parseFloat(insight.spend)) : 0;
                
                return (
                  <div key={campaign.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{campaign.objective}</p>
                      </div>
                      
                      <button
                        onClick={() => analyzeCampaign(campaign)}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
                      >
                        Analyze
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Spend</p>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(insight.spend)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ROAS</p>
                        <p className={`text-sm font-semibold ${roas >= 2 ? 'text-green-600' : 'text-red-600'}`}>
                          {roas.toFixed(2)}x
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Conversions</p>
                        <p className="text-sm font-semibold text-gray-900">{purchases?.value || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Conv. Value</p>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(purchaseValue?.value || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CTR</p>
                        <p className="text-sm font-semibold text-gray-900">{formatPercent(insight.ctr)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CPC</p>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(insight.cpc)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">CPM</p>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(insight.cpm)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Frequency</p>
                        <p className="text-sm font-semibold text-gray-900">{parseFloat(insight.frequency || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
