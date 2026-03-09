import { useNavigate, useLocation } from 'react-router-dom';
import DatabaseSearchDescription from './Home/DatabaseSearchDescription';
import './About.css';

export default function About() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleBack = () => {
        const from = location.state?.from || '/';
        navigate(from);
    };

    return (
        <div id="page">
            <div className="navigation-buttons">
                <button className="t2_bold left" onClick={handleBack}>
                    ← Back
                </button>
            </div>
            <div className="about-container">
                <h2 className="home-h2">About</h2>
                <h1>About Brownotate Database Search</h1>
                <DatabaseSearchDescription compact={false} />
            </div>
        </div>
    );
}