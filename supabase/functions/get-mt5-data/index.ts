import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const accountLogin = url.searchParams.get('login');

    if (!accountLogin) {
      return new Response(
        JSON.stringify({ error: 'MT5 login required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For now, return simulated data
    // In production, this would connect to MetaAPI
    const simulatedData = {
      balance: 10000,
      equity: 10450.50,
      margin: 1200.00,
      freeMargin: 9250.50,
      marginLevel: 870.88,
      openTrades: 3,
      profit: 450.50,
      profitPercentage: 4.51,
      totalTrades: 45,
      winRate: 62.22,
      averageWin: 125.50,
      averageLoss: 75.30,
      profitFactor: 1.67,
      sharpeRatio: 1.85,
      maxDrawdown: 3.2,
      lastUpdate: new Date().toISOString(),
      isLiveData: false,
      trades: [
        {
          id: '1',
          symbol: 'EURUSD',
          type: 'BUY',
          volume: 0.1,
          openPrice: 1.0850,
          currentPrice: 1.0875,
          profit: 25.00,
          openTime: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          symbol: 'GBPUSD',
          type: 'SELL',
          volume: 0.2,
          openPrice: 1.2750,
          currentPrice: 1.2720,
          profit: 60.00,
          openTime: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: '3',
          symbol: 'USDJPY',
          type: 'BUY',
          volume: 0.15,
          openPrice: 149.50,
          currentPrice: 149.85,
          profit: 52.50,
          openTime: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
    };

    return new Response(JSON.stringify(simulatedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in get-mt5-data:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
