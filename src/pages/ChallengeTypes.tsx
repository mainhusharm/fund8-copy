import { useEffect, useState } from 'react';
import { Zap, Trophy, CreditCard, Flame, TrendingUp, Crown, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GradientText from '../components/ui/GradientText';
import { supabase } from '../lib/db';

interface ChallengeType {
  id: string;
  challenge_code: string;
  challenge_name: string;
  description: string;
  is_active: boolean;
  recommended: boolean;
}

interface PricingTier {
  id: string;
  account_size: number;
  regular_price: number;
  discount_price: number;
  platform_cost: number;
  phase_1_price?: number;
  phase_2_price?: number;
  profit_target_pct?: number;
  profit_target_amount?: number;
  phase_1_target_pct?: number;
  phase_2_target_pct?: number;
  phase_1_target_amount?: number;
  phase_2_target_amount?: number;
  daily_dd_pct: number;
  max_dd_pct: number;
  min_trading_days: number;
  time_limit_days?: number;
}

const iconMap: Record<string, any> = {
  RAPID_FIRE: Zap,
  CLASSIC_2STEP: Trophy,
  PAYG_2STEP: CreditCard,
  AGGRESSIVE_2STEP: Flame,
  SWING_PRO: TrendingUp,
  ELITE_ROYAL: Crown
};

const colorMap: Record<string, string> = {
  RAPID_FIRE: 'from-orange-500 to-red-500',
  CLASSIC_2STEP: 'from-blue-500 to-indigo-500',
  PAYG_2STEP: 'from-green-500 to-emerald-500',
  AGGRESSIVE_2STEP: 'from-red-500 to-pink-500',
  SWING_PRO: 'from-purple-500 to-violet-500',
  ELITE_ROYAL: 'from-yellow-500 to-amber-500'
};

export default function ChallengeTypes() {
  const [challenges, setChallenges] = useState<ChallengeType[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [pricingTiers, setPricingTiers] = useState<Record<string, PricingTier[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        setLoading(false);
        return;
      }

      const { data: challengeData, error: challengeError } = await supabase
        .from('challenge_types')
        .select('*')
        .eq('is_active', true)
        .order('recommended', { ascending: false });

      if (challengeError) throw challengeError;

      if (challengeData) {
        setChallenges(challengeData);

        for (const challenge of challengeData) {
          const { data: pricingData, error: pricingError } = await supabase
            .from('challenge_pricing')
            .select('*')
            .eq('challenge_type_id', challenge.id)
            .order('account_size', { ascending: true });

          if (pricingError) throw pricingError;

          if (pricingData) {
            setPricingTiers(prev => ({
              ...prev,
              [challenge.challenge_code]: pricingData
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-electric-blue"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <GradientText>Choose Your Challenge</GradientText>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            6 unique evaluation programs designed for different trading styles. All with 50% discount and instant access.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {challenges.map((challenge) => {
            const Icon = iconMap[challenge.challenge_code] || Trophy;
            const gradient = colorMap[challenge.challenge_code] || 'from-blue-500 to-purple-500';

            return (
              <div
                key={challenge.id}
                className="glass-card p-6 cursor-pointer hover:border-electric-blue/50 transition-all relative"
                onClick={() => setSelectedChallenge(
                  selectedChallenge === challenge.challenge_code ? null : challenge.challenge_code
                )}
              >
                {challenge.recommended && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    RECOMMENDED
                  </div>
                )}

                <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon size={32} className="text-white" />
                </div>

                <h3 className="text-2xl font-bold mb-2">{challenge.challenge_name}</h3>
                <p className="text-gray-400 text-sm mb-4">{challenge.description}</p>

                <button className="w-full btn-gradient">
                  {selectedChallenge === challenge.challenge_code ? 'Hide Details' : 'View Pricing'}
                </button>
              </div>
            );
          })}
        </div>

        {selectedChallenge && pricingTiers[selectedChallenge] && (
          <div className="glass-card p-8 mb-12">
            <h2 className="text-3xl font-bold mb-6">
              {challenges.find(c => c.challenge_code === selectedChallenge)?.challenge_name} - Pricing
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4">Account Size</th>
                    <th className="text-left py-4 px-4">Regular Price</th>
                    <th className="text-left py-4 px-4">50% Discount</th>
                    {selectedChallenge === 'PAYG_2STEP' && (
                      <>
                        <th className="text-left py-4 px-4">Phase 1</th>
                        <th className="text-left py-4 px-4">Phase 2</th>
                      </>
                    )}
                    <th className="text-left py-4 px-4">Profit Target</th>
                    <th className="text-left py-4 px-4">Rules</th>
                    <th className="text-left py-4 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {pricingTiers[selectedChallenge].map((tier) => (
                    <tr key={tier.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-4 font-bold">${tier.account_size.toLocaleString()}</td>
                      <td className="py-4 px-4 text-gray-400 line-through">${tier.regular_price}</td>
                      <td className="py-4 px-4 text-green-400 font-bold text-xl">${tier.discount_price}</td>

                      {selectedChallenge === 'PAYG_2STEP' && (
                        <>
                          <td className="py-4 px-4 text-sm">
                            ${tier.phase_1_price ? (tier.phase_1_price / 2).toFixed(0) : 0}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            ${tier.phase_2_price ? (tier.phase_2_price / 2).toFixed(0) : 0}
                          </td>
                        </>
                      )}

                      <td className="py-4 px-4">
                        {tier.phase_1_target_pct ? (
                          <div className="text-sm">
                            <div>Phase 1: {tier.phase_1_target_pct}% (${tier.phase_1_target_amount?.toLocaleString()})</div>
                            <div>Phase 2: {tier.phase_2_target_pct}% (${tier.phase_2_target_amount?.toLocaleString()})</div>
                          </div>
                        ) : (
                          <div className="text-sm">
                            {tier.profit_target_pct}% (${tier.profit_target_amount?.toLocaleString()})
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-sm">
                        <div>Daily DD: {tier.daily_dd_pct}%</div>
                        <div>Max DD: {tier.max_dd_pct}%</div>
                        <div>Min Days: {tier.min_trading_days}</div>
                        {tier.time_limit_days && <div>Time Limit: {tier.time_limit_days} days</div>}
                      </td>

                      <td className="py-4 px-4">
                        <button className="px-4 py-2 bg-electric-blue hover:bg-electric-blue/80 rounded-lg font-semibold transition">
                          Purchase
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Challenge Rules Summary</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>All trading strategies allowed (EAs, news trading, scalping)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Minimum 2 trades per day required</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Must trade at least 2 different instruments</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Consistency requirements apply (no single-day profits)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Real-time drawdown monitoring</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span>80-90% profit split on funded accounts</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="glass-card p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help Choosing?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Not sure which challenge is right for you? Check out our comparison guide or contact our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/faq" className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition">
              View FAQ
            </a>
            <a href="/support" className="px-8 py-4 btn-gradient">
              Contact Support
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
