import { useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAnnotations } from '../contexts/AnnotationsContext';
import { useUser } from '../contexts/UserContext';
import AnnotationCard from "./MyAnnotations/AnnotationCard";
import Loading from '../components/Loading';

export default function MyAnnotations() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { annotations, fetchUserAnnotations, isLoading } = useAnnotations();

  useEffect(() => {
      if (location.state?.from !== 'annotation-results') {
        // Fast initial fetch for UI responsiveness, then lightweight live updates.
        fetchUserAnnotations(user, false);
      }
  }, [location.state, user, fetchUserAnnotations]);

  useEffect(() => {
    if (!user) return undefined;

    // Keep progress and active step live without forcing a manual page refresh.
    const fastRefresh = setInterval(() => {
      fetchUserAnnotations(user, false);
    }, 5000);

    // Less frequent health check to detect orphaned processes.
    const processHealthRefresh = setInterval(() => {
      fetchUserAnnotations(user, true);
    }, 60000);

    return () => {
      clearInterval(fastRefresh);
      clearInterval(processHealthRefresh);
    };
  }, [user, fetchUserAnnotations]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page">
      <div className="navigation-buttons">
        <div></div>
        <button className="t2_bold right" onClick={() => navigate('/')}>Back Home</button>   
      </div>
      <div className="my-annotations-container">
        <h2 className="home-h2">My Annotations</h2>
        <div className="annotation-list">      
          {annotations.map((annotation, index) => (
            annotation.parameters && annotation.parameters.id ? (
              <AnnotationCard key={index} user={user} annotation={annotation}/>
            ) : (
              <div key={index}></div>
            )
          ))}

        </div>
      </div>
      {isLoading && (
				<Loading />
			)}
    </div>
    
  );
}