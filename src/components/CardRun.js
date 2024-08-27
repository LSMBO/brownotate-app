import "./CardRun.css"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRuns } from '../contexts/RunsContext';
import axios from 'axios';

const CardRun = ({ user, id, data, status, parameters }) => {
    const navigate = useNavigate();
    const { fetchUserRuns } = useRuns();

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
        const response = await axios.post('http://134.158.151.129:80/delete_run', { id: data.parameters.id });
        fetchUserRuns(user)
      } catch (error) {
        console.error('Error:', error);
      }
    }

    const handleClick = () => {
        navigate(`run/${parameters.id}`);
    };

      return (
        <div className={`run-card t2_light ${status}`} onClick={handleClick}>
          <button onClick={(e) => handleDeleteRun(e)}>X</button>
          <span><b>Date: </b>{formatDate(parameters.id)}</span>
          <span><b>Species: </b><i>{parameters.species.scientificName}</i></span>
          <span><b>Status: </b>{status}</span>
        </div>
      );
    };
    
    export default CardRun;
