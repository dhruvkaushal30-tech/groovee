import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import { api } from '../services/api';

export default function UserList() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    api.get('/admin/users').then((res) => setUsers(res.data.users));
  }, []);

  if (!users) return <Loader />;

  return (
    <div>
      <h1>Users</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
