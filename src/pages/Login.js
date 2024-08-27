import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useRuns } from '../contexts/RunsContext'
import axios from 'axios';

export default function Login({setIsLoggedIn}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('browna@unistra.fr');
  const [error, setError] = useState('');
  const { setUser } = useUser();
  const { fetchUserRuns } = useRuns();


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://134.158.151.129:80/login', { email });
      if (response.data.message === 'Login successful') {
        setIsLoggedIn(true);
		setUser(email);
    fetchUserRuns(email);
		navigate('/');
      } else {
        setError('Invalid email address');
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
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="t2_bold" type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}