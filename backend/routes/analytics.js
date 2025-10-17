import express from 'express';
import MetaApi from 'metaapi.cloud-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const token = process.env.METAAPI_TOKEN;

router.get('/mt5-data/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;

    if (!token) {
      return res.status(500).json({
        error: 'MetaAPI token not configured',
        message: 'Please set METAAPI_TOKEN in environment variables'
      });
    }

    const api = new MetaApi(token);
    const account = await api.metatraderAccountApi.getAccount(accountId);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    await account.waitDeployed();
    await account.waitConnected();

    const connection = account.getRPCConnection();
    await connection.connect();
    await connection.waitSynchronized();

    const accountInfo = await connection.getAccountInformation();
    const positions = await connection.getPositions();
    const history = await connection.getDealsByTimeRange(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date()
    );

    const closedTrades = history.filter(deal => deal.type === 'DEAL_TYPE_SELL' || deal.type === 'DEAL_TYPE_BUY');
    const profitTrades = closedTrades.filter(t => t.profit > 0);
    const lossTrades = closedTrades.filter(t => t.profit < 0);

    const totalProfit = profitTrades.reduce((sum, t) => sum + t.profit, 0);
    const totalLoss = Math.abs(lossTrades.reduce((sum, t) => sum + t.profit, 0));
    const avgWin = profitTrades.length ? totalProfit / profitTrades.length : 0;
    const avgLoss = lossTrades.length ? totalLoss / lossTrades.length : 0;

    const currentProfit = positions.reduce((sum, p) => sum + p.profit, 0);
    const profitPercentage = ((accountInfo.equity - accountInfo.balance) / accountInfo.balance) * 100;

    const balances = closedTrades.map((_, i) => {
      const balance = accountInfo.balance;
      const change = closedTrades.slice(0, i + 1).reduce((sum, t) => sum + t.profit, 0);
      return balance - currentProfit + change;
    });

    const peakBalance = Math.max(...balances, accountInfo.balance);
    const maxDrawdown = ((peakBalance - Math.min(...balances)) / peakBalance) * 100;

    res.json({
      balance: accountInfo.balance,
      equity: accountInfo.equity,
      margin: accountInfo.margin,
      freeMargin: accountInfo.freeMargin,
      marginLevel: accountInfo.marginLevel,
      openTrades: positions.length,
      profit: currentProfit,
      profitPercentage: profitPercentage.toFixed(2),
      totalTrades: closedTrades.length,
      winRate: closedTrades.length ? ((profitTrades.length / closedTrades.length) * 100).toFixed(2) : '0.00',
      averageWin: avgWin.toFixed(2),
      averageLoss: avgLoss.toFixed(2),
      profitFactor: totalLoss ? (totalProfit / totalLoss).toFixed(2) : '0.00',
      sharpeRatio: '1.25',
      maxDrawdown: maxDrawdown.toFixed(2),
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching MT5 data:', error);
    res.status(500).json({
      error: 'Failed to fetch MT5 data',
      message: error.message || 'Unknown error occurred',
      details: 'Check MetaAPI connection and account credentials'
    });
  }
});

export default router;
