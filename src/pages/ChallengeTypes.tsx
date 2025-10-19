import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Trophy, CreditCard, Flame, TrendingUp, Crown, CheckCircle, X, ArrowRight, DollarSign } from 'lucide-react';
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

const colorMap: Record<string, { border: string; bg: string; accent: string }> = {
  RAPID_FIRE: { border: 'border-orange-500/50', bg: 'bg-orange-500/10', accent: 'text-orange-400' },
  CLASSIC_2STEP: { border: 'border-blue-500/50', bg: 'bg-blue-500/10', accent: 'text-blue-400' },
  PAYG_2STEP: { border: 'border-green-500/50', bg: 'bg-green-500/10', accent: 'text-green-400' },
  AGGRESSIVE_2STEP: { border: 'border-red-500/50', bg: 'bg-red-500/10', accent: 'text-red-400' },
  SWING_PRO: { border: 'border-purple-500/50', bg: 'bg-purple-500/10', accent: 'text-purple-400' },
  ELITE_ROYAL: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', accent: 'text-yellow-400' }
};

export default function ChallengeTypes() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<ChallengeType[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeType | null>(null);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

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
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeClick = async (challenge: ChallengeType) => {
    setSelectedChallenge(challenge);
    setSelectedTier(null);

    const { data: pricingData, error: pricingError } = await supabase
      .from('challenge_pricing')
      .select('*')
      .eq('challenge_type_id', challenge.id)
      .order('account_size', { ascending: true });

    if (pricingError) {
      console.error('Error fetching pricing:', pricingError);
      return;
    }

    if (pricingData) {
      setPricingTiers(pricingData);
    }
  };

  const handlePurchase = async (tier: PricingTier) => {
    const navState = {
      returnTo: '/payment',
      accountSize: tier.account_size,
      challengeType: selectedChallenge?.challenge_code,
      originalPrice: tier.discount_price
    };

    console.log('ChallengeTypes navigating to signup with state:', navState);

    navigate('/signup', { state: navState });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="text-2xl">Loading challenges...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Choose Your <GradientText>Challenge Type</GradientText>
            </h1>
            <p className="text-xl text-gray-400">
              6 unique challenges designed for different trading styles. Find your perfect match.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {challenges.map((challenge) => {
              const Icon = iconMap[challenge.challenge_code];
              const colors = colorMap[challenge.challenge_code];

              return (
                <div
                  key={challenge.id}
                  onClick={() => handleChallengeClick(challenge)}
                  className={`glass-card p-8 cursor-pointer transition-all hover:scale-105 ${colors.border} hover:shadow-xl relative group`}
                >
                  {challenge.recommended && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                      RECOMMENDED
                    </div>
                  )}

                  <div className={`${colors.bg} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={colors.accent} size={40} />
                  </div>

                  <h3 className="text-2xl font-bold mb-3">{challenge.challenge_name}</h3>
                  <p className="text-gray-400 mb-6">{challenge.description}</p>

                  <button className={`w-full py-3 ${colors.bg} ${colors.accent} rounded-lg font-semibold hover:bg-opacity-80 transition-all flex items-center justify-center space-x-2`}>
                    <span>View Details</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-6xl w-full my-8 relative z-[10000]">
            <button
              onClick={() => setSelectedChallenge(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <div className="flex items-center space-x-4 mb-8">
                {(() => {
                  const Icon = iconMap[selectedChallenge.challenge_code];
                  const colors = colorMap[selectedChallenge.challenge_code];
                  return (
                    <>
                      <div className={`${colors.bg} w-16 h-16 rounded-xl flex items-center justify-center`}>
                        <Icon className={colors.accent} size={32} />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold">{selectedChallenge.challenge_name}</h2>
                        <p className="text-gray-400">{selectedChallenge.description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4">Select Account Size</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pricingTiers.map((tier) => (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier)}
                      className={`glass-card p-6 cursor-pointer transition-all hover:scale-105 ${
                        selectedTier?.id === tier.id ? 'border-2 border-electric-blue' : ''
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">
                          ${tier.account_size.toLocaleString()}
                        </div>

                        {selectedChallenge.challenge_code === 'PAYG_2STEP' ? (
                          <div className="space-y-1">
                            <div className="text-sm text-gray-400">Phase 1</div>
                            <div className="text-2xl font-bold text-green-400">
                              ${(tier.phase_1_price! / 2).toFixed(0)}
                            </div>
                            <div className="text-xs text-gray-500 line-through">
                              ${tier.phase_1_price}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-3xl font-bold text-neon-green mb-1">
                              ${tier.discount_price}
                            </div>
                            <div className="text-sm text-gray-500 line-through">
                              ${tier.regular_price}
                            </div>
                            <div className="text-xs text-green-400 font-bold">
                              50% OFF
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTier && (
                <div className="glass-card p-6 mb-6 bg-blue-500/10 border-blue-500/30">
                  <h4 className="text-xl font-bold mb-4">Challenge Details</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={20} />
                      <span>
                        Account Size: <strong>${selectedTier.account_size.toLocaleString()}</strong>
                      </span>
                    </div>

                    {selectedTier.phase_1_target_pct && (
                      <>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="text-green-400" size={20} />
                          <span>
                            Phase 1: {selectedTier.phase_1_target_pct}% (${selectedTier.phase_1_target_amount?.toLocaleString()})
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="text-green-400" size={20} />
                          <span>
                            Phase 2: {selectedTier.phase_2_target_pct}% (${selectedTier.phase_2_target_amount?.toLocaleString()})
                          </span>
                        </div>
                      </>
                    )}

                    {selectedTier.profit_target_pct && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="text-green-400" size={20} />
                        <span>
                          Profit Target: {selectedTier.profit_target_pct}% (${selectedTier.profit_target_amount?.toLocaleString()})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={20} />
                      <span>Daily DD: {selectedTier.daily_dd_pct}%</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={20} />
                      <span>Max DD: {selectedTier.max_dd_pct}%</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={20} />
                      <span>Min Trading Days: {selectedTier.min_trading_days}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CheckCircle className="text-green-400" size={20} />
                      <span>
                        Time Limit: {selectedTier.time_limit_days ? `${selectedTier.time_limit_days} days` : 'Unlimited'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(selectedTier)}
                    className="w-full mt-6 py-4 btn-gradient text-xl font-bold flex items-center justify-center space-x-3 group"
                  >
                    <DollarSign size={24} />
                    <span>Purchase Challenge - ${selectedTier.discount_price}</span>
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              <div className="glass-card p-6 bg-yellow-500/10 border-yellow-500/30">
                <h4 className="text-xl font-bold mb-3 flex items-center space-x-2">
                  <Trophy className="text-yellow-400" size={24} />
                  <span>What's Included</span>
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span>Unlimited trading time (where applicable)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span>Trade all major forex pairs, commodities, indices, and crypto</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span>Keep 75-100% of profits based on payout cycle</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span>Choose from weekly to bi-monthly payouts</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span>No consistency rules or minimum days between trades</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span>Real-time tracking dashboard</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
