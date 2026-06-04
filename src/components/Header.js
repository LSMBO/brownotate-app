// import logo from "../assets/main_logo_cut.png"
import logo from "../assets/main_logo.png"
import { useUser } from '../contexts/UserContext';
import { useNavigate, useLocation } from 'react-router-dom';
import "./Header.css"


export default function Header({ setIsLoggedIn }) {
    const { user, isGuest, logout } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        navigate('/login');
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleAbout = () => {
        navigate('/about', { state: { from: location.pathname || '/login' } });
    };

    return (
        <div className="header-container">
            <div className="header">
                <img src={logo} alt="logo"/>
                <div className="title">
                    <h1>Brownotate</h1>
                    <h4 className="t2_light">A comprehensive solution to generate a protein sequence database for any species</h4>
                </div>
                <div className="header-user-section">
                    {isGuest && (
                        <span className="guest-badge">GUEST MODE</span>
                    )}
                    {user && !isGuest && (
                        <span className="user-email t2_light">{user}</span>
                    )}
                    {user ? (
                        <>
                            <button className="logout-btn t2_bold" onClick={handleLogout}>
                                {isGuest ? 'Login' : 'Logout'}
                            </button>
                            <button className="about-btn t2_bold" onClick={handleAbout}>About</button>
                        </>
                    ) : (
                        <>
                            <button className="logout-btn t2_bold" onClick={handleLogin}>Login</button>
                            <button className="about-btn t2_bold" onClick={handleAbout}>About</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}