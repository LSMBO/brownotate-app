import "./CardRun.css"
import { useNavigate } from "react-router-dom";
import { useRuns } from '../contexts/RunsContext';
import axios from 'axios';
import CONFIG from '../config';
import resumeArrowIcon from "../assets/resume_arrow.png"

const CardRun = ({ user, id, data, status, parameters }) => {
    const navigate = useNavigate();
    const { fetchUserRuns, fetchCPUs } = useRuns();

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
      try {
        await axios.post(`${CONFIG.API_BASE_URL}/delete_run`, { id: data.parameters.id });
        fetchUserRuns(user)
        fetchCPUs();
      } catch (error) {
        console.error('Error:', error);
      }
    }

    const handleResumeRun = async (e) => {
      e.stopPropagation();
      try {
        await axios.post(`${CONFIG.API_BASE_URL}/resume_run`, { id: data.parameters.id });
        fetchUserRuns(user)
        fetchCPUs();
      } catch (error) {
        console.error('Error:', error);
      }
    }

    const handleClick = () => {
        fetchCPUs();
        navigate(`run/${parameters.id}`);
    };

      return (
        <div className={`run-card t2_light ${status}`} onClick={handleClick}>
          <button className="delete-btn" onClick={(e) => handleDeleteRun(e)}>X</button>
          {status === "failed" && (
            <button className="resume-btn" onClick={(e) => handleResumeRun(e)}>
              <label>RESUME</label>
              <img src={resumeArrowIcon} alt="Resume icon" className="resume-icon" />
            </button>
          )}
          <span><b>Date: </b>{formatDate(parameters.id)}</span>
          <span><b>Species: </b><i>{parameters.species.scientificName}</i></span>
          <span><b>Status: </b>{status}</span>
        </div>
      );
    };
    
    export default CardRun;
