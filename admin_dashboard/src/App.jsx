import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (token) fetchDashboard();
  }, [token]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/dashboard`, { headers });
      const data = await res.json();
      setDashboardData(data.dashboard);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchUsers = async (search = '') => {
    try {
      const res = await fetch(`${API_BASE}/admin/users?search=${search}`, { headers });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWithdrawals = async (status = 'pending') => {
    try {
      const res = await fetch(`${API_BASE}/admin/withdrawals?status=${status}`, { headers });
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWithdrawalAction = async (id, action, reason = '') => {
    try {
      await fetch(`${API_BASE}/admin/withdrawals/${id}/action`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, reason }),
      });
      fetchWithdrawals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBanUser = async (userId) => {
    const reason = prompt('Enter ban reason:');
    if (!reason) return;
    try {
      await fetch(`${API_BASE}/admin/users/${userId}/ban`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <h1 style={styles.loginTitle}>CashBurst Admin</h1>
          <input
            type="password"
            placeholder="Enter admin token"
            style={styles.input}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setToken(e.target.value);
                localStorage.setItem('admin_token', e.target.value);
              }
            }}
          />
          <p style={styles.hint}>Press Enter to login</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <nav style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>CashBurst</h2>
        <p style={styles.sidebarSubtitle}>Admin Panel</p>
        <div style={styles.navItems}>
          {['dashboard', 'users', 'withdrawals', 'kyc', 'notifications', 'analytics'].map(page => (
            <button
              key={page}
              onClick={() => {
                setCurrentPage(page);
                if (page === 'users') fetchUsers();
                if (page === 'withdrawals') fetchWithdrawals();
              }}
              style={{
                ...styles.navButton,
                backgroundColor: currentPage === page ? '#FFD700' : 'transparent',
                color: currentPage === page ? '#0A0E21' : '#B0B0C3',
              }}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => { setToken(''); localStorage.removeItem('admin_token'); }} style={styles.logoutBtn}>
          Logout
        </button>
      </nav>

      <main style={styles.main}>
        {currentPage === 'dashboard' && dashboardData && (
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <div style={styles.statsGrid}>
              <StatCard title="Total Users" value={dashboardData.totalUsers} color="#448AFF" />
              <StatCard title="Active Today" value={dashboardData.activeUsers} color="#00E676" />
              <StatCard title="Total Earnings" value={`₹${(dashboardData.totalEarnings || 0).toFixed(2)}`} color="#FFD700" />
              <StatCard title="Pending Withdrawals" value={dashboardData.pendingWithdrawals} color="#FF5252" />
              <StatCard title="Total Withdrawn" value={`₹${(dashboardData.totalWithdrawn || 0).toFixed(2)}`} color="#FFAB00" />
              <StatCard title="Banned Users" value={dashboardData.bannedUsers} color="#FF5252" />
              <StatCard title="KYC Pending" value={dashboardData.kycPending} color="#448AFF" />
            </div>
          </div>
        )}

        {currentPage === 'users' && (
          <div>
            <h1 style={styles.pageTitle}>User Management</h1>
            <input
              type="text"
              placeholder="Search users..."
              style={styles.searchInput}
              onChange={(e) => fetchUsers(e.target.value)}
            />
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Level</th>
                  <th style={styles.th}>Coins</th>
                  <th style={styles.th}>Earnings</th>
                  <th style={styles.th}>Referrals</th>
                  <th style={styles.th}>KYC</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={styles.tr}>
                    <td style={styles.td}>{user.name}</td>
                    <td style={styles.td}>{user.phone}</td>
                    <td style={styles.td}><span style={{...styles.badge, backgroundColor: '#FFD70033', color: '#FFD700'}}>{user.level}</span></td>
                    <td style={styles.td}>{user.coinBalance}</td>
                    <td style={styles.td}>₹{(user.totalEarnings || 0).toFixed(2)}</td>
                    <td style={styles.td}>{user.totalReferrals}</td>
                    <td style={styles.td}>{user.isKycVerified ? '✓' : '✗'}</td>
                    <td style={styles.td}>{user.isBanned ? <span style={{color:'#FF5252'}}>Banned</span> : <span style={{color:'#00E676'}}>Active</span>}</td>
                    <td style={styles.td}>
                      <button onClick={() => handleBanUser(user._id)} style={styles.actionBtn}>
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {currentPage === 'withdrawals' && (
          <div>
            <h1 style={styles.pageTitle}>Withdrawal Management</h1>
            <div style={styles.filterRow}>
              {['pending', 'approved', 'rejected', 'completed'].map(status => (
                <button key={status} onClick={() => fetchWithdrawals(status)} style={styles.filterBtn}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w._id} style={styles.tr}>
                    <td style={styles.td}>{w.userId?.name || 'N/A'}</td>
                    <td style={styles.td}>₹{w.amount}</td>
                    <td style={styles.td}>{w.method?.toUpperCase()}</td>
                    <td style={styles.td}><span style={{...styles.badge, backgroundColor: w.status === 'pending' ? '#FFAB0033' : w.status === 'approved' ? '#00E67633' : '#FF525233', color: w.status === 'pending' ? '#FFAB00' : w.status === 'approved' ? '#00E676' : '#FF5252'}}>{w.status}</span></td>
                    <td style={styles.td}>{new Date(w.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      {w.status === 'pending' && (
                        <>
                          <button onClick={() => handleWithdrawalAction(w._id, 'approve')} style={{...styles.actionBtn, backgroundColor: '#00E67633', color: '#00E676'}}>Approve</button>
                          <button onClick={() => { const r = prompt('Rejection reason:'); if(r) handleWithdrawalAction(w._id, 'reject', r); }} style={{...styles.actionBtn, backgroundColor: '#FF525233', color: '#FF5252', marginLeft: 8}}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {currentPage === 'analytics' && (
          <div>
            <h1 style={styles.pageTitle}>Analytics</h1>
            <p style={{color: '#B0B0C3'}}>Analytics dashboard with charts will be available with Chart.js integration.</p>
          </div>
        )}

        {currentPage === 'kyc' && (
          <div>
            <h1 style={styles.pageTitle}>KYC Management</h1>
            <p style={{color: '#B0B0C3'}}>KYC verification queue and management interface.</p>
          </div>
        )}

        {currentPage === 'notifications' && (
          <div>
            <h1 style={styles.pageTitle}>Push Notifications</h1>
            <p style={{color: '#B0B0C3'}}>Send broadcast or targeted push notifications to users.</p>
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
    <p style={styles.statTitle}>{title}</p>
    <p style={{ ...styles.statValue, color }}>{value}</p>
  </div>
);

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#0A0E21', color: '#fff', fontFamily: 'sans-serif' },
  sidebar: { width: 240, backgroundColor: '#1A1F38', padding: 20, display: 'flex', flexDirection: 'column' },
  sidebarTitle: { color: '#FFD700', fontSize: 20, fontWeight: 'bold', margin: 0 },
  sidebarSubtitle: { color: '#B0B0C3', fontSize: 12, marginBottom: 24 },
  navItems: { flex: 1 },
  navButton: { display: 'block', width: '100%', padding: '10px 16px', border: 'none', borderRadius: 8, marginBottom: 4, cursor: 'pointer', fontSize: 14, textAlign: 'left', fontWeight: 500 },
  logoutBtn: { padding: '10px 16px', border: '1px solid #FF5252', borderRadius: 8, backgroundColor: 'transparent', color: '#FF5252', cursor: 'pointer' },
  main: { flex: 1, padding: 24, overflowY: 'auto' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#fff' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
  statCard: { backgroundColor: '#1A1F38', borderRadius: 12, padding: 20 },
  statTitle: { color: '#B0B0C3', fontSize: 13, margin: '0 0 8px' },
  statValue: { fontSize: 28, fontWeight: 'bold', margin: 0 },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 16 },
  th: { textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #242942', color: '#B0B0C3', fontSize: 13 },
  td: { padding: '12px 16px', borderBottom: '1px solid #242942', fontSize: 14 },
  tr: { backgroundColor: '#1A1F38' },
  badge: { padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600 },
  actionBtn: { padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, backgroundColor: '#FFD70033', color: '#FFD700' },
  searchInput: { width: '100%', maxWidth: 400, padding: '10px 16px', borderRadius: 8, border: '1px solid #242942', backgroundColor: '#1A1F38', color: '#fff', fontSize: 14, marginBottom: 16 },
  filterRow: { display: 'flex', gap: 8, marginBottom: 16 },
  filterBtn: { padding: '8px 16px', borderRadius: 8, border: '1px solid #242942', backgroundColor: '#1A1F38', color: '#B0B0C3', cursor: 'pointer', fontSize: 13 },
  loginContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0A0E21' },
  loginCard: { backgroundColor: '#1A1F38', borderRadius: 16, padding: 40, textAlign: 'center', width: 360 },
  loginTitle: { color: '#FFD700', fontSize: 24, marginBottom: 24 },
  input: { width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #242942', backgroundColor: '#0A0E21', color: '#fff', fontSize: 14, boxSizing: 'border-box' },
  hint: { color: '#B0B0C3', fontSize: 12, marginTop: 8 },
};

export default AdminDashboard;
