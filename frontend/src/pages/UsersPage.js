import React, { useEffect, useState } from 'react';
import API from '../services/api';

const UsersPage = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    API.get('/users')
      .then(res => setUsers(res.data.data.users))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await API.delete(`/users/${id}`); fetchUsers(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  const handleRoleChange = async (id, role) => {
    try { await API.put(`/users/${id}`, { role }); fetchUsers(); }
    catch (err) { alert(err.response?.data?.message || 'Update failed'); }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Users</h1>
          <p>{users.length} registered accounts</p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <div className="loading-screen"><span className="spinner"></span> Loading...</div>
          ) : users.length === 0 ? (
            <div className="empty-state"><div className="icon">👥</div><p>No users found</p></div>
          ) : (
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th></th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight:500 }}>{u.name}</td>
                    <td style={{ color:'var(--text-muted)' }}>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        style={{ border:'0.5px solid var(--border)', borderRadius:6, padding:'4px 8px', fontSize:12, fontFamily:'inherit', background:'var(--surface)', outline:'none' }}
                      >
                        <option value="viewer">viewer</option>
                        <option value="analyst">analyst</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-income' : 'badge-viewer'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ color:'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
