import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useAnnotations } from '../contexts/AnnotationsContext'
import axios from 'axios';
import CONFIG from '../config';

export default function Login({setIsLoggedIn}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const { fetchUserAnnotations, fetchCPUs } = useAnnotations();


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${CONFIG.API_BASE_URL}/login`, { email, password });
      if (response.data.message === 'Login successful') {
        setIsLoggedIn(true);
		setUser(email);
    fetchUserAnnotations(email, true);
    fetchCPUs();
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
      <h2 className="home-h2">Sign In to Your Account</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <label className="t2_light">Email</label>
        <input
          type="text"
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
        <button className="submit-button t2_bold" type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}