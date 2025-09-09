import "./AnnotationCard.css"
import { useNavigate } from "react-router-dom";
import { useAnnotations } from '../../contexts/AnnotationsContext';
import axios from 'axios';
import CONFIG from '../../config';
import resumeArrowIcon from "../../assets/resume_arrow.png"
import Image from "../../components/Image";
import AnnotationProgressBar from "./AnnotationProgressBar";
import { handleAnnotationRun } from '../../utils/AnnotationRun';

const AnnotationCard = ({ user, annotation }) => {
    const navigate = useNavigate();
    const { waitingTime, fetchUserAnnotations, fetchCPUs, updateAnnotation, setIsLoading } = useAnnotations();

    const formatDate = (dateTimeString) => {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
        });
    };

    const handleDeleteRun = async (e) => {
      e.stopPropagation();
      const confirmDelete = window.confirm("Are you sure you want to completely delete this annotation?");
      if (!confirmDelete) {
        return;
      }
      setIsLoading(true);
      try {
        await axios.post(`${CONFIG.API_BASE_URL}/delete_run`, { id: annotation.parameters.id });
        fetchUserAnnotations(user, true)
        fetchCPUs();
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    }

    const handleResumeRun = async (e) => {
      e.stopPropagation();
      fetchCPUs();
      await updateAnnotation(user, annotation.parameters.id, 'status', 'running');
      handleAnnotationRun(annotation.parameters.id, user, updateAnnotation, true)
    }

    const handleClick = (tab) => {
        navigate(`/my-annotations/${annotation.parameters.id}`, { state: { tab: tab } });
    };

    return (
      <div className={`annotation-card t2_light ${annotation.status}`}>
        <button className="delete-btn" onClick={async (e) => { await handleDeleteRun(e); }}>X</button>

        <div className="taxonomy-annotation-card">
          <Image file={annotation.parameters.species.imageUrl}/>
          <div className="annotation-infos">
            <label>
              <i>{annotation.parameters.species.scientificName.charAt(0).toUpperCase() + annotation.parameters.species.scientificName.slice(1).toLowerCase()}</i>&nbsp;[TaxID: {annotation.parameters.species.taxonID}]
            </label>
            <label>{formatDate(annotation.parameters.id)}</label>
          </div>
        </div>
        <AnnotationProgressBar annotation={annotation} waitingTime={waitingTime}/>
        <div className="annotation-details">
          <button onClick={ () => handleClick('parameters') }>Parameters</button>
          <button disabled={annotation.status !== "completed"} onClick={ () => handleClick('results') }>Results</button>
        </div>
        {annotation.status === "failed" && (
          <h4>Pipeline failed</h4>
        )}
        {annotation.status === "failed" && annotation.error && (
          <>
            <div className="annotation-error-box">
              {annotation.error.message && (
                <div><b>Message:</b> {annotation.error.message}</div>
              )}
              {annotation.error.command && (
                <div><b>Command:</b> <code>{annotation.error.command}</code></div>
              )}
              {annotation.error.stderr && annotation.error.stderr.trim() && (
                <div className="error-block"><b>stderr:</b><pre>{annotation.error.stderr}</pre></div>
              )}
              {annotation.error.stdout && annotation.error.stdout.trim() && (
                <div className="error-block"><b>stdout:</b><pre>{annotation.error.stdout}</pre></div>
              )}
              <div><b>Run ID:</b> {annotation.parameters.id}</div>
              {annotation.error.timer && (
                <div><b>Time before failure:</b> {annotation.error.timer}</div>
              )}
            </div>
          </>
        )}
        {annotation.status === "failed" && (
          <button className="resume-btn" onClick={(e) => { handleResumeRun(e); }}>
              <label>RESUME</label>
              <img src={resumeArrowIcon} alt="Resume icon" className="resume-icon" />
            </button>
        )}
      </div>
    );

}
export default AnnotationCard;
