import { useEffect, useState } from 'react';
import { Check, X, TrendingUp, Zap, Scale, Award, Clock } from 'lucide-react';
import GradientText from '../components/ui/GradientText';
import { supabase } from '../lib/db';

interface ChallengeType {
  type_name: string;
  display_name: string;
  description: string;
  marketing_tagline: string;
  number_of_phases: number;
  phase1_profit_target: number;
  phase1_max_drawdown: number;
  phase1_daily_loss_limit: number;
  phase1_min_trading_days: number;
  phase1_time_limit_days: number;
  phase2_profit_target: number;
  phase2_max_drawdown: number;
  phase2_daily_loss_limit: number;
  phase2_min_trading_days: number;
  phase2_time_limit_days: number;
  requires_consistency_score: boolean;
  min_consistency_score: number;
  profit_split_trader_percent: number;
  challenge_fee: number;
}

const iconMap: Record<string, typeof TrendingUp> = {
  standard: TrendingUp,
  rapid: Zap,
  scaling: Scale,
  professional: Award,
  swing: Clock
};

export default function ChallengeTypes() {
  const [challengeTypes, setChallengeTypes] = useState<ChallengeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChallengeTypes() {
      try {
        const { data, error } = await supabase
          .from('challenge_types')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (error) throw error;
        setChallengeTypes(data || []);
      } catch (error) {
        console.error('Error fetching challenge types:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChallengeTypes();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white text-xl">Loading challenge types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <GradientText>Challenge Types</GradientText>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Choose the evaluation program that matches your trading style and goals.
            Each challenge is designed for specific trading approaches.
          </p>
        </div>

        <div className="grid gap-8">
          {challengeTypes.map((challenge) => {
            const Icon = iconMap[challenge.type_name] || TrendingUp;

            return (
              <div key={challenge.type_name} className="glass-card p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="p-4 bg-gradient-to-br from-electric-blue to-neon-purple rounded-2xl">
                    <Icon size={32} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-2">
                      <GradientText>{challenge.display_name}</GradientText>
                    </h2>
                    <p className="text-lg text-white/70 mb-2">{challenge.marketing_tagline}</p>
                    <p className="text-white/60">{challenge.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white/60 mb-1">Starting at</div>
                    <div className="text-3xl font-bold text-neon-green">
                      ${challenge.challenge_fee.toFixed(0)}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 text-electric-blue">
                      Phase 1 Requirements
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">Profit Target:</span>
                        <span className="font-bold text-neon-green">
                          {challenge.phase1_profit_target}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Max Drawdown:</span>
                        <span className="font-bold text-red-400">
                          {challenge.phase1_max_drawdown}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Daily Loss Limit:</span>
                        <span className="font-bold text-red-400">
                          {challenge.phase1_daily_loss_limit}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Min Trading Days:</span>
                        <span className="font-bold">{challenge.phase1_min_trading_days} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Time Limit:</span>
                        <span className="font-bold">
                          {challenge.phase1_time_limit_days} days
                        </span>
                      </div>
                    </div>
                  </div>

                  {challenge.number_of_phases === 2 && (
                    <div className="bg-white/5 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4 text-neon-purple">
                        Phase 2 Requirements
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/70">Profit Target:</span>
                          <span className="font-bold text-neon-green">
                            {challenge.phase2_profit_target}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Max Drawdown:</span>
                          <span className="font-bold text-red-400">
                            {challenge.phase2_max_drawdown || challenge.phase1_max_drawdown}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Daily Loss Limit:</span>
                          <span className="font-bold text-red-400">
                            {challenge.phase2_daily_loss_limit || challenge.phase1_daily_loss_limit}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Min Trading Days:</span>
                          <span className="font-bold">
                            {challenge.phase2_min_trading_days} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Time Limit:</span>
                          <span className="font-bold">
                            {challenge.phase2_time_limit_days} days
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-neon-green/20 to-electric-blue/20 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">Key Features</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Check size={20} className="text-neon-green" />
                      <span>{challenge.profit_split_trader_percent}% Profit Split</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check size={20} className="text-neon-green" />
                      <span>{challenge.number_of_phases} Phase Evaluation</span>
                    </div>
                    {challenge.requires_consistency_score && (
                      <div className="flex items-center gap-3">
                        <Check size={20} className="text-neon-green" />
                        <span>Consistency Score: {challenge.min_consistency_score}%</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Check size={20} className="text-neon-green" />
                      <span>No Weekend Holding Rules</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check size={20} className="text-neon-green" />
                      <span>Trade News Events</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Check size={20} className="text-neon-green" />
                      <span>Expert Advisors Allowed</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Trading Rules</h3>
                  <div className="space-y-3 text-white/80">
                    <div className="flex items-start gap-3">
                      <Check size={20} className="text-neon-green flex-shrink-0 mt-1" />
                      <p>
                        <strong>Maximum Drawdown:</strong> Total account loss cannot exceed {challenge.phase1_max_drawdown}% from the initial balance or highest balance reached.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check size={20} className="text-neon-green flex-shrink-0 mt-1" />
                      <p>
                        <strong>Daily Loss Limit:</strong> You cannot lose more than {challenge.phase1_daily_loss_limit}% of your starting balance in a single trading day (00:00-23:59 server time).
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check size={20} className="text-neon-green flex-shrink-0 mt-1" />
                      <p>
                        <strong>Minimum Trading Days:</strong> You must trade for at least {challenge.phase1_min_trading_days} days before requesting payout. A trading day is any day with at least one position opened.
                      </p>
                    </div>
                    {challenge.requires_consistency_score && (
                      <div className="flex items-start gap-3">
                        <Check size={20} className="text-neon-green flex-shrink-0 mt-1" />
                        <p>
                          <strong>Consistency:</strong> Your best trading day cannot exceed {challenge.min_consistency_score}% of your total net profit to ensure consistent performance.
                        </p>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <X size={20} className="text-red-400 flex-shrink-0 mt-1" />
                      <p>
                        <strong>Prohibited:</strong> Copy trading from external sources, hedging between accounts, arbitrage strategies, or high-frequency trading (HFT) are not allowed.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="px-8 py-3 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg font-semibold hover:scale-105 transition-transform">
                    Choose This Challenge
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 glass-card p-8">
          <h2 className="text-3xl font-bold mb-6">
            <GradientText>Need Help Choosing?</GradientText>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xl font-bold mb-3 text-electric-blue">New Traders</h3>
              <p className="text-white/70 mb-3">
                Start with the <strong>Standard Challenge</strong>. It offers balanced targets and enough time to prove your skills.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-neon-purple">Experienced Traders</h3>
              <p className="text-white/70 mb-3">
                Try the <strong>Rapid Challenge</strong> for quick funding or <strong>Professional Challenge</strong> for higher profit splits.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-neon-green">Position Traders</h3>
              <p className="text-white/70 mb-3">
                The <strong>Swing Trader Challenge</strong> is perfect with its 60-day timeframe and wider stop losses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
