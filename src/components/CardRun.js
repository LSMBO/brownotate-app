import "./CardRun.css"
import { useNavigate } from "react-router-dom";
import { useRuns } from '../contexts/RunsContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import CONFIG from '../config';
import resumeArrowIcon from "../assets/resume_arrow.png"

const CardRun = ({ user, id, data, status, parameters }) => {
    const navigate = useNavigate();
    const { fetchUserRuns, fetchCPUs, startRunMonitoring } = useRuns();
    const [showDialog, setShowDialog] = useState(status === "failed");
    
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

      useEffect(() => {
        if (status === "failed") {
            setShowDialog(true);
        } else {
            setShowDialog(false);
        }
      }, [status]);

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
        startRunMonitoring(user);
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
          <span><b>Date: </b>{formatDate(parameters.id)}</span>
          <span><b>Species: </b><i>{parameters.species.scientificName}</i></span>
          <span><b>Status: </b>{status}</span>
          {status === "failed" && (
              <>
                  <button className="resume-btn" onClick={(e) => { handleResumeRun(e); }}>
                      <label>RESUME</label>
                      <img src={resumeArrowIcon} alt="Resume icon" className="resume-icon" />
                  </button>
                  {showDialog && (
                      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
                          <div className="dialog-content">
                              <p><b>Your request failed.</b> This can sometimes happen due to communication problems between servers.</p>
                              <p>Please <b>Resume</b> your task. If the issue persists, we recommand deleting this run and creating a new one.</p>
                              <p>If the problem continues, feel free to contact the administrator at <b>browna@unistra.fr</b> for further assistance.</p>
                              <button onClick={() => setShowDialog(false)}>OK</button>
                          </div>
                          <div className="dialog-arrow"></div>
                      </div>
                  )}
              </>
          )}
      </div>
  );
};

    export default CardRun;
