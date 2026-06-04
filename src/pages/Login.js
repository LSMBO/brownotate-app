import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useAnnotations } from '../contexts/AnnotationsContext'
import axios from 'axios';
import CONFIG from '../config';
import './Login.css';

const ACCOUNT_ACCESS_CODE = '255A}qh8UO33';

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountStep, setAccountStep] = useState('code');
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  const [showAccountExistsModal, setShowAccountExistsModal] = useState(false);
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showPasswordUpdatedModal, setShowPasswordUpdatedModal] = useState(false);
  const [passwordUpdatedMessage, setPasswordUpdatedMessage] = useState('Password updated successfully');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPassword, setForgotPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isSubmittingForgotPassword, setIsSubmittingForgotPassword] = useState(false);
  const { loginAsUser, loginAsGuest } = useUser();
  const { fetchUserAnnotations, fetchCPUs } = useAnnotations();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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

  const handleToggleForgotPassword = () => {
    setShowForgotPasswordModal(true);
    setForgotError('');
    setForgotEmail(email);
    setForgotPassword('');
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotEmail.includes('@')) {
      setForgotError('Email must contain @.');
      return;
    }

    if (forgotPassword.length < 4) {
      setForgotError('New password must contain at least 4 characters.');
      return;
    }

    setIsSubmittingForgotPassword(true);
    try {
      const response = await axios.post(`${CONFIG.API_BASE_URL}/reset_password`, {
        email: forgotEmail.trim(),
        password: forgotPassword,
      });
      setPasswordUpdatedMessage(response.data.message || 'Password updated successfully');
      setShowForgotPasswordModal(false);
      setShowPasswordUpdatedModal(true);
      setEmail(forgotEmail.trim());
      setPassword('');
      setForgotPassword('');
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Unable to reset password.';
      setForgotError(message);
    } finally {
      setIsSubmittingForgotPassword(false);
    }
  };

  const handleAccessCodeSubmit = (e) => {
    e.preventDefault();
    setAccountError('');
    setAccountSuccess('');

    if (accessCode !== ACCOUNT_ACCESS_CODE) {
      setAccountStep('code');
      setAccountError('Invalid code.');
      return;
    }

    setAccountStep('credentials');
  };

  const submitCreateAccount = async (confirmUpdate = false) => {
    setAccountError('');
    setAccountSuccess('');
    setShowAccountExistsModal(false);

    if (!accountEmail.includes('@')) {
      setAccountError('Email must contain @.');
      return;
    }

    if (accountPassword.length < 4) {
      setAccountError('Password must contain at least 4 characters.');
      return;
    }

    setIsSubmittingAccount(true);
    try {
      const response = await axios.post(`${CONFIG.API_BASE_URL}/create_account`, {
        accessCode,
        email: accountEmail.trim(),
        password: accountPassword,
        confirmUpdate,
      });

      if (response.data.action === 'updated') {
        setPasswordUpdatedMessage(response.data.message || 'Password updated successfully');
        setShowPasswordUpdatedModal(true);
      } else {
        setAccountSuccess(response.data.message);
      }
      setEmail(accountEmail.trim());
      setPassword('');
      setAccountPassword('');
      setShowAccountExistsModal(false);
    } catch (requestError) {
      const response = requestError.response;
      const message = response?.data?.message || 'Unable to create the account.';
      if (response?.status === 409) {
        setShowAccountExistsModal(true);
        setAccountError('');
        return;
      }
      setAccountError(message);
    } finally {
      setIsSubmittingAccount(false);
    }
  };

  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    await submitCreateAccount(false);
  };

  const handleUpdatePassword = async () => {
    await submitCreateAccount(true);
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
        <div className="login-left-panel">
          <div className="signin-section">
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
              <div className="login-actions-row">
                <button className="btn-tab-style t2_bold" type="submit">
                  Login
                </button>
                <button
                  type="button"
                  className="btn-tab-style t2_bold"
                  onClick={handleToggleForgotPassword}
                >
                  Forgot Password
                </button>
              </div>
            </form>
            {error && <p className="error-message">{error}</p>}
          </div>          
          <div className="guest-section">
            <h3>Browse as Guest</h3>
            <p className="t2_light guest-description">Explore the database without an account</p>
            <button
              className="btn-tab-style t2_bold active guest-mode-button"
              onClick={handleGuestLogin}
            >
              Guest Mode
            </button>
            <p className="t2_light guest-mode-note">
              Database searches only • Registration required for annotations
            </p>
          </div>
        </div>
        
        <div className="login-right">
          <div className="account-request-card">
            <div className="account-request-header">
              <h3>Create an Account</h3>
            </div>

            {accountStep === 'code' && (
              <form className="login-form account-request-form" onSubmit={handleAccessCodeSubmit}>
                <label className="t2_light access-code-label">
                  Access code
                  <div className="tooltip-container" aria-label="Account access policy">
                    <span className="help-span">Account creation is restricted to our laboratory. Please contact fbertile@unistra.fr if you need access.</span>
                  </div>
                </label>
                <input
                  type="password"
                  placeholder="Enter your access code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                />
                <button
                  className="btn-tab-style t2_bold validate-code-button"
                  type="submit"
                >
                  Validate Code
                </button>
              </form>
            )}

            {accountStep === 'credentials' && (
              <form className="login-form account-request-form" onSubmit={handleCreateAccountSubmit}>
                <label className="t2_light">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  required
                />
                <label className="t2_light">Password</label>
                <input
                  type="password"
                  placeholder="Choose a password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  required
                />
                <div className="account-request-actions">
                  <button
                    className="btn-tab-style t2_bold active"
                    type="submit"
                    disabled={isSubmittingAccount}
                  >
                    {isSubmittingAccount ? 'Submitting...' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

            {accountError && <p className="error-message">{accountError}</p>}
            {accountSuccess && <p className="success-message">{accountSuccess}</p>}
          </div>
          
          <h3 className="cite-title">Cite us</h3>
          <p className="t2_light cite-block">
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
      {showAccountExistsModal && (
        <div className="account-modal-overlay" role="dialog" aria-modal="true" aria-label="Account exists confirmation">
          <div className="account-modal-card">
            <h3>This email is already used</h3>
            <p>Do you want to update the password for this account?</p>
            <div className="account-request-actions">
              <button
                className="btn-tab-style t2_bold active"
                type="button"
                onClick={handleUpdatePassword}
                disabled={isSubmittingAccount}
              >
                Yes I want to update my password
              </button>
              <button
                className="btn-tab-style t2_bold"
                type="button"
                onClick={() => setShowAccountExistsModal(false)}
                disabled={isSubmittingAccount}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
      {showForgotPasswordModal && (
        <div className="account-modal-overlay" role="dialog" aria-modal="true" aria-label="Forgot password">
          <div className="account-modal-card">
            <h3>Forgot Password</h3>
            <form className="login-form modal-form" onSubmit={handleForgotPasswordSubmit}>
              <label className="t2_light">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
              <label className="t2_light">New Password</label>
              <input
                type="password"
                placeholder="Enter your new password"
                value={forgotPassword}
                onChange={(e) => setForgotPassword(e.target.value)}
                required
              />
              {forgotError && <p className="error-message">{forgotError}</p>}
              <div className="account-request-actions">
                <button className="btn-tab-style t2_bold active forgot-update-button" type="submit" disabled={isSubmittingForgotPassword}>
                  {isSubmittingForgotPassword ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  className="btn-tab-style t2_bold"
                  type="button"
                  onClick={() => {
                    setShowForgotPasswordModal(false);
                    setForgotError('');
                  }}
                  disabled={isSubmittingForgotPassword}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showPasswordUpdatedModal && (
        <div className="account-modal-overlay" role="dialog" aria-modal="true" aria-label="Password updated">
          <div className="account-modal-card">
            <h3>Password updated</h3>
            <p>{passwordUpdatedMessage}</p>
            <div className="account-request-actions">
              <button
                className="btn-tab-style t2_bold active"
                type="button"
                onClick={() => setShowPasswordUpdatedModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}