import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useAnnotations } from '../contexts/AnnotationsContext'
import axios from 'axios';
import CONFIG from '../config';

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAsUser, loginAsGuest } = useUser();
  const { fetchUserAnnotations, fetchCPUs } = useAnnotations();


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${CONFIG.API_BASE_URL}/login`, { email, password });
      if (response.data.message === 'Login successful') {
        setIsLoggedIn(true);
        loginAsUser(email);
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

  const handleGuestLogin = () => {
    setIsLoggedIn(true);
    loginAsGuest();
    fetchCPUs();
    navigate('/');
  };

  return (
    <div>
      <h2 className="home-h2">Welcome to Brownotate</h2>
      <div className="login-container">
        <div style={{ width: '50%' }}>
          <div style={{ borderBottom: '1px solid #ddd', margin: '40px 0', paddingBottom: '30px' }}>
            <h3>Sign In</h3>
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
              <button className="btn-tab-style t2_bold" type="submit" style={{ width: '150px', margin: '20px auto' }}>
                Login
              </button>
            </form>
            {error && <p className="error-message">{error}</p>}
          </div>          
          <h3>Browse as Guest</h3>
          <p className="t2_light">Explore the database without an account</p>
          <button 
            className="btn-tab-style t2_bold active" 
            onClick={handleGuestLogin}
            style={{ width: '200px', margin: '20px auto' }}
          >
            Guest Mode
          </button>
          <p className="t2_light" style={{ fontSize: '0.9rem', color: '#666' }}>
            Database searches only • Registration required for annotations
          </p>
        </div>
        
        <div className="login-right">
          <h3>Need an Account?</h3>
          <p className="t2_light">
            Contact us at <a href="mailto:browna@unistra.fr">browna@unistra.fr</a> to create an account.
          </p>
          
          <h3 style={{ marginTop: '40px' }}>Cite us</h3>
          <p className="t2_light" style={{ textAlign: 'justify', lineHeight: '1.6' }}>
            <strong>Brownotate: A Comprehensive Solution to Generate Protein Sequence Databases for Any Species</strong>
            <br/><br/>
            Adrien Brown, Alexandre Burel, Sarah Cianférani, Christine Carapito, Fabrice Bertile
            <br/><br/>
            <em>Proteomics</em>, First published: 06 January 2026
            <br/>
            <a href="https://analyticalsciencejournals.onlinelibrary.wiley.com/doi/10.1002/pmic.70094" target="_blank" rel="noopener noreferrer">
              https://doi.org/10.1002/pmic.70094
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}