import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useRuns } from '../contexts/RunsContext'
import axios from 'axios';
import CONFIG from '../config';

export default function Login({setIsLoggedIn}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const { fetchUserRuns } = useRuns();


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${CONFIG.API_BASE_URL}/login`, { email, password });
      if (response.data.message === 'Login successful') {
        setIsLoggedIn(true);
		setUser(email);
    fetchUserRuns(email);
		navigate('/');
      } else {
        setError('Invalid email address or password');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred');
    }
  };

  return (
    <div>
      <h2 className='login-h2'>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <label className="t2_light">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="t2_light">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="t2_bold" type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}