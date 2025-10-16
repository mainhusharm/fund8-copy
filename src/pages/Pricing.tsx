import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GradientText from '../components/ui/GradientText';
import { ACCOUNT_SIZES, CHALLENGE_TYPES, getPricing, getProfitSplit } from '../types/challenges';
import type { ChallengeType } from '../types/challenges';
import { getCurrentUser } from '../lib/auth';

export default function Pricing() {
  const [selectedSize, setSelectedSize] = useState(10000);

  return (
    <div className="min-h-screen bg-deep-space">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <GradientText>Choose Your Challenge</GradientText>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
              Select your account size, then choose your challenge type. 30 combinations available.
            </p>
            <button
              onClick={() => window.location.href = '/challenge-types'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-all hover:scale-105"
            >
              Learn More About Challenges
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-6">
              Step 1: <GradientText>Select Account Size</GradientText>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
              {ACCOUNT_SIZES.map(account => (
                <button
                  key={account.size}
                  onClick={() => setSelectedSize(account.size)}
                  className={`p-4 rounded-lg border-2 transition-all hover-lift ${
                    selectedSize === account.size
                      ? 'border-electric-blue bg-electric-blue/20'
                      : 'border-white/10 bg-white/5 hover:border-electric-blue/50'
                  }`}
                >
                  <div className="text-2xl font-bold">
                    ${(account.size / 1000)}K
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {account.features[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-6">
              Step 2: <GradientText>Choose Challenge Type</GradientText>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {CHALLENGE_TYPES.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  accountSize={selectedSize}
                />
              ))}
            </div>
          </div>

          <div className="glass-card p-8 overflow-x-auto mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">
              <GradientText>Compare Challenge Types</GradientText>
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-3 text-left">Feature</th>
                  {CHALLENGE_TYPES.map(c => (
                    <th key={c.id} className="p-3 text-center">{c.displayName}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="p-3">Phases</td>
                  {CHALLENGE_TYPES.map(c => (
                    <td key={c.id} className="p-3 text-center">{c.phases}</td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-3">Profit Target</td>
                  {CHALLENGE_TYPES.map(c => (
                    <td key={c.id} className="p-3 text-center">
                      {c.phase1Target}%{c.phase2Target ? ` → ${c.phase2Target}%` : ''}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-3">Max Drawdown</td>
                  {CHALLENGE_TYPES.map(c => (
                    <td key={c.id} className="p-3 text-center">{c.maxDrawdown}%</td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-3">Time Limit</td>
                  {CHALLENGE_TYPES.map(c => (
                    <td key={c.id} className="p-3 text-center">
                      {c.timeLimit ? `${c.timeLimit}d` : 'Unlimited'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-3">Difficulty</td>
                  {CHALLENGE_TYPES.map(c => (
                    <td key={c.id} className="p-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded ${
                        c.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
                        c.difficulty === 'Advanced' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {c.difficulty}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3">Consistency Score</td>
                  {CHALLENGE_TYPES.map(c => (
                    <td key={c.id} className="p-3 text-center">{c.consistencyScoreRequired}/10</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">
              <GradientText>Why Choose Larger Account Sizes?</GradientText>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 p-6 rounded-lg">
                <h3 className="font-bold mb-2 text-lg">Higher Profit Splits</h3>
                <p className="text-gray-400 text-sm">
                  $100K+ accounts get 90-95% profit split vs 80-85% on smaller accounts
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg">
                <h3 className="font-bold mb-2 text-lg">Faster Payouts</h3>
                <p className="text-gray-400 text-sm">
                  $200K accounts get weekly payouts instead of bi-weekly
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-lg">
                <h3 className="font-bold mb-2 text-lg">VIP Support</h3>
                <p className="text-gray-400 text-sm">
                  $50K+ accounts get priority support and dedicated account managers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ChallengeCard({ challenge, accountSize }: { challenge: ChallengeType; accountSize: number }) {
  const navigate = useNavigate();
  const price = getPricing(accountSize, challenge.id);
  const profitSplit = getProfitSplit(accountSize, challenge.id);

  const handleGetStarted = async () => {
    const user = await getCurrentUser();
    if (!user) {
      navigate('/signup', {
        state: {
          returnTo: '/payment',
          accountSize,
          challengeType: challenge.id,
          originalPrice: price
        }
      });
    } else {
      navigate('/payment', {
        state: {
          accountSize,
          challengeType: challenge.id,
          originalPrice: price
        }
      });
    }
  };

  return (
    <div className={`glass-card p-8 hover-lift relative ${
      challenge.recommended ? 'border-2 border-electric-blue' : ''
    }`}>
      {challenge.badge && (
        <div className="absolute top-4 right-4 bg-neon-green/20 text-neon-green text-xs px-3 py-1 rounded-full font-bold border border-neon-green/30">
          {challenge.badge}
        </div>
      )}

      <h3 className="text-2xl font-bold mb-2">{challenge.displayName}</h3>
      <p className="text-gray-400 text-sm mb-4">{challenge.tagline}</p>

      <div className="mb-6">
        <div className="text-4xl font-bold">
          <GradientText>${price}</GradientText>
        </div>
        <div className="text-sm text-gray-400">
          for ${(accountSize / 1000)}K account
        </div>
      </div>

      <div className="space-y-2 mb-6 pb-6 border-b border-white/10">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Phases</span>
          <span className="font-semibold">{challenge.phases}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Target</span>
          <span className="font-semibold">
            {challenge.phase1Target}%{challenge.phase2Target ? ` → ${challenge.phase2Target}%` : ''}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Drawdown</span>
          <span className="font-semibold">{challenge.maxDrawdown}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Time Limit</span>
          <span className="font-semibold">
            {challenge.timeLimit ? `${challenge.timeLimit} days` : 'Unlimited'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Profit Split</span>
          <span className="font-semibold text-neon-green">{profitSplit}%</span>
        </div>
      </div>

      <ul className="space-y-2 mb-6">
        {challenge.features.map((feature: string, i: number) => (
          <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
            <Check size={16} className="text-neon-green mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mb-4 text-center">
        <span className={`text-xs px-3 py-1 rounded-full ${
          challenge.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
          challenge.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' :
          challenge.difficulty === 'Advanced' ? 'bg-purple-500/20 text-purple-400' :
          challenge.difficulty === 'Professional' ? 'bg-orange-500/20 text-orange-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {challenge.difficulty}
        </span>
      </div>

      <button
        onClick={handleGetStarted}
        className="w-full btn-gradient py-3 rounded-lg font-semibold mb-3 flex items-center justify-center space-x-2 group"
      >
        <span>Get Started - ${price}</span>
        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
      </button>

      <p className="text-xs text-gray-500 text-center">
        {challenge.description}
      </p>
    </div>
  );
}
