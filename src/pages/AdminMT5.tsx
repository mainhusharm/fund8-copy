import { useState, useEffect } from 'react';
import { supabase } from '../lib/db';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GradientText from '../components/ui/GradientText';
import { Plus, Send, Eye, EyeOff, Copy, Check, X, Search } from 'lucide-react';

interface MT5Account {
  account_id: string;
  user_id: string;
  mt5_login: string;
  mt5_password: string;
  mt5_server: string;
  account_type: string;
  account_size: number;
  current_balance: number;
  status: string;
  is_sent: boolean;
  created_at: string;
  user_email?: string;
  user_name?: string;
  unique_user_id?: string;
}

export default function AdminMT5() {
  const [accounts, setAccounts] = useState<MT5Account[]>([]);
  const [pendingChallenges, setPendingChallenges] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch user data
      const { data: usersData, error: usersError } = await supabase.rpc('get_users_for_admin');
      if (usersError) throw usersError;

      const usersMap = new Map(usersData?.map((u: any) => [u.id, u]) || []);

      // Fetch ALL user challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('user_challenges')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (challengesError) throw challengesError;

      // Separate pending challenges (no trading_account_id yet)
      const pending = challengesData?.filter(c => !c.trading_account_id && c.status !== 'pending_payment').map((c: any) => {
        const user = usersMap.get(c.user_id);
        return {
          id: c.id,
          user_id: c.user_id,
          user_email: user?.email || 'Unknown',
          user_name: user?.full_name || 'N/A',
          account_size: c.account_size,
          challenge_type: c.challenge_type_id,
          status: c.status,
          phase: 'pending_credentials',
          created_at: c.purchase_date
        };
      }) || [];

      setPendingChallenges(pending);

      // Format challenges as "accounts" for display
      const formattedAccounts = challengesData?.filter(c => c.trading_account_id).map((c: any) => {
        const user = usersMap.get(c.user_id);
        return {
          account_id: c.id,
          user_id: c.user_id,
          mt5_login: c.trading_account_id || 'Not Assigned',
          mt5_password: c.trading_account_password || 'Not Set',
          mt5_server: c.trading_account_server || 'MetaQuotes-Demo',
          account_type: c.challenge_type_id || 'Standard',
          account_size: c.account_size,
          current_balance: 0,
          status: c.status,
          is_sent: c.credentials_sent || false,
          created_at: c.purchase_date,
          user_email: user?.email || 'Unknown',
          user_name: user?.full_name || 'N/A',
          unique_user_id: c.trading_account_id
        };
      }) || [];

      setAccounts(formattedAccounts);

      // Set users from the already loaded data
      if (usersData) {
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.mt5_login.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.account_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-space flex items-center justify-center">
        <div className="loader-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-space">
      <Navbar />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <GradientText>MT5 Account Management</GradientText>
              </h1>
              <p className="text-gray-400">Manually create and manage user MT5 accounts</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-gradient flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Create Account</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              label="Pending Setup"
              value={pendingChallenges.length}
              icon="⏳"
              color="orange"
            />
            <StatCard
              label="Total Accounts"
              value={accounts.length}
              icon="👥"
              color="blue"
            />
            <StatCard
              label="Active"
              value={accounts.filter(a => a.status === 'active').length}
              icon="✅"
              color="green"
            />
            <StatCard
              label="Total Balance"
              value={`$${accounts.reduce((sum, a) => sum + Number(a.current_balance), 0).toLocaleString()}`}
              icon="💰"
              color="purple"
            />
          </div>

          {/* Pending Challenges Section */}
          {pendingChallenges.length > 0 && (
            <div className="glass-card p-6 mb-8 border-2 border-yellow-500/50">
              <h2 className="text-2xl font-bold mb-2 text-yellow-400">⏳ Pending Challenges - Needs MT5 Credentials</h2>
              <p className="text-gray-400 mb-6">These users have purchased challenges and are waiting for MT5 account setup</p>

              <div className="space-y-4">
                {pendingChallenges.map(challenge => (
                  <div key={challenge.id} className="bg-white/5 rounded-lg p-4 border border-yellow-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="font-bold text-lg">User ID: {challenge.unique_user_id}</div>
                          <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-semibold">
                            Awaiting Setup
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">Email</div>
                            <div className="font-semibold">{challenge.user_email}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Account Size</div>
                            <div className="font-semibold">${parseFloat(challenge.account_size).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Platform</div>
                            <div className="font-semibold">{challenge.platform}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Created</div>
                            <div className="font-semibold">{new Date(challenge.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="ml-4 px-4 py-2 bg-gradient-to-r from-electric-blue to-neon-purple rounded-lg font-semibold hover:scale-105 transition-transform"
                      >
                        Assign MT5
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
              />
            </div>
          </div>

          {/* Accounts List */}
          <div className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">All MT5 Accounts</h2>

            {filteredAccounts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No MT5 accounts found</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-gradient"
                >
                  Create First Account
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAccounts.map(account => (
                  <AccountCard
                    key={account.account_id}
                    account={account}
                    onUpdate={loadData}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateAccountModal
          users={users}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadData();
          }}
        />
      )}

      <Footer />
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colors = {
    blue: 'bg-electric-blue/20 border-electric-blue/30',
    green: 'bg-neon-green/20 border-neon-green/30',
    orange: 'bg-orange-500/20 border-orange-500/30',
    purple: 'bg-cyber-purple/20 border-cyber-purple/30'
  };

  return (
    <div className={`glass-card p-6 border ${colors[color as keyof typeof colors]}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold">
        <GradientText>{value}</GradientText>
      </div>
    </div>
  );
}

function AccountCard({ account, onUpdate }: { account: MT5Account; onUpdate: () => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const sendCredentials = async () => {
    setSending(true);
    try {
      // Mark as sent first (this will make credentials visible to user)
      const { error: updateError } = await supabase
        .from('user_challenges')
        .update({
          credentials_sent: true,
          credentials_sent_at: new Date().toISOString()
        })
        .eq('id', account.account_id);

      if (updateError) throw updateError;

      alert('Credentials marked as sent! User can now see them in their dashboard.');
      onUpdate();
    } catch (error) {
      console.error('Error sending credentials:', error);
      alert('Failed to mark credentials as sent');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white/5 p-6 rounded-lg border border-white/10 hover:border-white/20 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-bold">{account.user_email}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              account.is_sent
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
            }`}>
              {account.is_sent ? 'Sent' : 'Pending'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-electric-blue/20 text-electric-blue border border-electric-blue/30">
              {account.account_type}
            </span>
            {account.unique_user_id && account.unique_user_id !== 'N/A' && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyber-purple/20 text-cyber-purple border border-cyber-purple/30">
                ID: {account.unique_user_id}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400">{account.user_name}</p>
        </div>
        {!account.is_sent && (
          <button
            onClick={sendCredentials}
            disabled={sending}
            className="flex items-center space-x-2 px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/30 transition-all disabled:opacity-50"
          >
            <Send size={16} />
            <span>{sending ? 'Sending...' : 'Send Credentials'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <CredentialField
          label="MT5 Login"
          value={account.mt5_login}
          onCopy={() => copyToClipboard(account.mt5_login, 'login')}
          copied={copied === 'login'}
        />
        <CredentialField
          label="Password"
          value={account.mt5_password}
          onCopy={() => copyToClipboard(account.mt5_password, 'password')}
          copied={copied === 'password'}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />
        <CredentialField
          label="Server"
          value={account.mt5_server}
          onCopy={() => copyToClipboard(account.mt5_server, 'server')}
          copied={copied === 'server'}
        />
        <CredentialField
          label="Balance"
          value={`$${Number(account.current_balance).toLocaleString()}`}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-white/10">
        <span>Created: {new Date(account.created_at).toLocaleDateString()}</span>
        <span>Account Size: ${Number(account.account_size).toLocaleString()}</span>
      </div>
    </div>
  );
}

function CredentialField({ label, value, onCopy, copied, showPassword, onTogglePassword }: any) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-black/50 px-3 py-2 rounded border border-white/10 font-mono text-sm">
          {showPassword !== undefined && !showPassword ? '••••••••' : value}
        </div>
        {showPassword !== undefined && (
          <button
            onClick={onTogglePassword}
            className="p-2 bg-white/5 rounded hover:bg-white/10 transition-all"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {onCopy && (
          <button
            onClick={onCopy}
            className="p-2 bg-white/5 rounded hover:bg-white/10 transition-all"
          >
            {copied ? <Check size={16} className="text-neon-green" /> : <Copy size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function CreateAccountModal({ users, onClose, onSuccess }: any) {
  const [pendingChallenges, setPendingChallenges] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [formData, setFormData] = useState({
    mt5_login: '',
    mt5_password: generatePassword(),
    mt5_server: 'MetaQuotes-Demo',
    leverage: 100
  });
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingChallenges();
  }, []);

  async function loadPendingChallenges() {
    try {
      const { data: challenges, error: challengesError } = await supabase
        .from('user_challenges')
        .select('*')
        .is('trading_account_id', null)
        .neq('status', 'pending_payment')
        .order('purchase_date', { ascending: false });

      if (challengesError) throw challengesError;

      // Get user data separately
      const { data: usersData, error: usersError } = await supabase.rpc('get_users_for_admin');
      if (usersError) throw usersError;

      const usersMap = new Map(usersData?.map((u: any) => [u.id, u]) || []);

      // Merge user data with challenges
      const enrichedChallenges = challenges?.map(challenge => {
        const user = usersMap.get(challenge.user_id);
        return {
          ...challenge,
          users: {
            email: user?.email || 'Unknown',
            full_name: user?.full_name || 'N/A'
          }
        };
      }) || [];

      setPendingChallenges(enrichedChallenges);
    } catch (error) {
      console.error('Error loading pending challenges:', error);
      setPendingChallenges([]);
    } finally {
      setLoading(false);
    }
  }

  const handleChallengeSelect = (challengeId: string) => {
    if (!challengeId) {
      setSelectedChallenge(null);
      return;
    }

    const challenge = pendingChallenges.find(c => c.id === challengeId);
    setSelectedChallenge(challenge);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedChallenge) {
      alert('Please select a challenge');
      return;
    }

    if (!formData.mt5_login) {
      alert('Please enter MT5 login ID');
      return;
    }

    setCreating(true);

    try {
      // Update the selected challenge with MT5 credentials
      const { error: updateError } = await supabase
        .from('user_challenges')
        .update({
          trading_account_id: formData.mt5_login,
          trading_account_password: formData.mt5_password,
          trading_account_server: formData.mt5_server,
          status: 'credentials_given',
          credentials_sent: false
        })
        .eq('id', selectedChallenge.id);

      if (updateError) throw updateError;

      alert('MT5 credentials assigned successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error assigning credentials:', error);
      alert('Failed to assign credentials');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass-card p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            <GradientText>Create MT5 Account</GradientText>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-white/60">Loading...</div>
        ) : pendingChallenges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/60 mb-4">No pending challenges found</p>
            <p className="text-sm text-white/50">All purchased challenges have been assigned MT5 credentials</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Select Pending Challenge *</label>
              <select
                value={selectedChallenge?.id || ''}
                onChange={(e) => handleChallengeSelect(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
              >
                <option value="">-- Select Challenge --</option>
                {pendingChallenges.map((challenge: any) => (
                  <option key={challenge.id} value={challenge.id} className="bg-deep-space">
                    {challenge.users?.email} - ${parseFloat(challenge.account_size).toLocaleString()} - {challenge.challenge_type_id}
                  </option>
                ))}
              </select>
            </div>

            {selectedChallenge && (
              <div className="p-4 bg-electric-blue/10 border border-electric-blue/30 rounded-lg">
                <h4 className="font-bold mb-2">Selected Challenge Details:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-white/60">User:</span>
                    <div className="font-semibold">{selectedChallenge.users?.email}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Account Size:</span>
                    <div className="font-semibold">${parseFloat(selectedChallenge.account_size).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Challenge Type:</span>
                    <div className="font-semibold">{selectedChallenge.challenge_type_id}</div>
                  </div>
                  <div>
                    <span className="text-white/60">Purchased:</span>
                    <div className="font-semibold">{new Date(selectedChallenge.purchase_date).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">MT5 Login *</label>
              <input
                type="text"
                value={formData.mt5_login}
                onChange={(e) => setFormData({ ...formData, mt5_login: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
                placeholder="e.g., 1234567"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Password *</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={formData.mt5_password}
                  onChange={(e) => setFormData({ ...formData, mt5_password: e.target.value })}
                  required
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, mt5_password: generatePassword() })}
                  className="px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20"
                >
                  🎲
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">MT5 Server *</label>
            <input
              type="text"
              value={formData.mt5_server}
              onChange={(e) => setFormData({ ...formData, mt5_server: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-electric-blue focus:outline-none"
              placeholder="e.g., MetaQuotes-Demo"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedChallenge || creating}
              className="px-6 py-3 bg-gradient-to-r from-neon-green to-electric-blue rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {creating ? 'Assigning...' : 'Assign MT5 Credentials'}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}

function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function generateEmailHTML(account: MT5Account) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #0066FF, #7B2EFF); padding: 40px 20px; text-align: center; color: white;">
        <h1>Your MT5 Account is Ready!</h1>
      </div>
      <div style="padding: 40px 20px; background: #f9f9f9;">
        <h2>Account Details:</h2>
        <div style="background: white; padding: 20px; border-left: 4px solid #0066FF;">
          <p><strong>Login:</strong> ${account.mt5_login}</p>
          <p><strong>Password:</strong> ${account.mt5_password}</p>
          <p><strong>Server:</strong> ${account.mt5_server}</p>
          <p><strong>Account Type:</strong> ${account.account_type}</p>
          <p><strong>Balance:</strong> $${account.current_balance}</p>
        </div>
        <p style="margin-top: 20px;">Download MT5: <a href="https://www.metatrader5.com/en/download">Click Here</a></p>
      </div>
    </div>
  `;
}
