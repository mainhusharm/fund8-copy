import { useState } from 'react';
import { Check, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/db';
import GradientText from '../ui/GradientText';

interface ContractAcceptanceProps {
  accountId: string;
  accountSize: number;
  accountType: string;
  onAccepted: () => void;
}

export default function ContractAcceptance({
  accountId,
  accountSize,
  accountType,
  onAccepted,
}: ContractAcceptanceProps) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAcceptContract() {
    if (!agreed) {
      setError('You must read and agree to the terms before proceeding');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const { ip } = await response.json();

      const { data, error: dbError } = await supabase.rpc('accept_contract', {
        p_account_id: accountId,
        p_ip_address: ip,
      });

      if (dbError) throw dbError;

      if (data?.success) {
        onAccepted();
      } else {
        setError(data?.error || 'Failed to accept contract');
      }
    } catch (err: any) {
      console.error('Error accepting contract:', err);
      setError(err.message || 'Failed to accept contract');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-electric-blue/10 to-cyber-purple/10 rounded-xl p-8 border border-white/20">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-electric-blue/20 rounded-lg">
          <FileText className="w-8 h-8 text-electric-blue" />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-2">
            <GradientText>Contract Acceptance Required</GradientText>
          </h3>
          <p className="text-white/70">
            Please review and accept the trading agreement to proceed with your ${accountSize.toLocaleString()} {accountType.toUpperCase()} challenge.
          </p>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-6 mb-6 border border-white/10 max-h-96 overflow-y-auto">
        <h4 className="font-bold text-lg mb-4">Fund8r Proprietary Trading Agreement</h4>

        <div className="space-y-4 text-sm text-white/80">
          <section>
            <h5 className="font-semibold text-white mb-2">1. Challenge Terms</h5>
            <p>You are entering a ${accountSize.toLocaleString()} {accountType.toUpperCase()} trading challenge with Fund8r. This is a simulated trading environment designed to evaluate your trading skills.</p>
          </section>

          <section>
            <h5 className="font-semibold text-white mb-2">2. Trading Rules</h5>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>You must adhere to all challenge rules including profit targets, drawdown limits, and daily loss limits</li>
              <li>Violation of any trading rule will result in immediate challenge termination</li>
              <li>All trades must be executed through the provided MT5 account</li>
              <li>News trading and high-frequency strategies are subject to review</li>
            </ul>
          </section>

          <section>
            <h5 className="font-semibold text-white mb-2">3. Account Credentials</h5>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>MT5 credentials will be provided after contract acceptance</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>Sharing credentials is strictly prohibited and will result in termination</li>
              <li>Credentials are non-transferable and locked after initial delivery</li>
            </ul>
          </section>

          <section>
            <h5 className="font-semibold text-white mb-2">4. Profit Split & Payouts</h5>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Upon successful completion, you will receive your designated profit split percentage</li>
              <li>Payouts are processed within 24-48 hours of request</li>
              <li>Minimum payout amount is $100 USD</li>
              <li>You may request payouts after meeting minimum trading day requirements</li>
            </ul>
          </section>

          <section>
            <h5 className="font-semibold text-white mb-2">5. Risk Disclosure</h5>
            <p>Trading in financial markets involves substantial risk of loss. While this is a funded account, you must demonstrate responsible risk management and trading discipline.</p>
          </section>

          <section>
            <h5 className="font-semibold text-white mb-2">6. Data & Privacy</h5>
            <p>Your trading data and personal information will be handled according to our Privacy Policy. We collect and analyze trading performance data to evaluate challenge progression.</p>
          </section>

          <section>
            <h5 className="font-semibold text-white mb-2">7. Termination</h5>
            <p>Fund8r reserves the right to terminate any challenge for rule violations, suspicious activity, or at our sole discretion. No refunds will be issued for terminated challenges due to rule violations.</p>
          </section>

          <section>
            <h5 className="font-semibold text-white mb-2">8. Agreement</h5>
            <p>By accepting this contract, you acknowledge that you have read, understood, and agree to abide by all terms and conditions outlined in this agreement and on the Fund8r website.</p>
          </section>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <label className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10 mb-6 cursor-pointer hover:bg-white/10 transition-colors">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => {
            setAgreed(e.target.checked);
            setError('');
          }}
          className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-electric-blue focus:ring-electric-blue focus:ring-offset-0"
        />
        <span className="text-sm text-white/80">
          I have read and agree to the Fund8r Proprietary Trading Agreement. I understand the trading rules,
          risk disclosures, and terms outlined above. I acknowledge that my IP address ({' '}
          <span className="text-electric-blue font-mono">will be recorded</span>) for legal verification purposes.
        </span>
      </label>

      <button
        onClick={handleAcceptContract}
        disabled={!agreed || loading}
        className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all ${
          agreed && !loading
            ? 'bg-gradient-to-r from-neon-green to-electric-blue text-black hover:scale-105'
            : 'bg-white/10 text-white/40 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            Processing...
          </>
        ) : (
          <>
            <Check className="w-6 h-6" />
            Accept Contract & Proceed
          </>
        )}
      </button>

      <p className="text-center text-xs text-white/50 mt-4">
        By clicking Accept, you electronically sign this agreement on {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
