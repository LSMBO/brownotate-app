import "./CardRun.css"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CardRun = ({ id, data, status, parameters }) => {
    const navigate = useNavigate();

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

      const handleClick = () => {
        navigate(`run/${parameters.id}`);
    };

      return (
        <div className={`run-card t2_light ${status}`} onClick={handleClick}>
          <span><b>Date: </b>{formatDate(parameters.id)}</span>
          <span><b>Species: </b><i>{parameters.species.scientificName}</i></span>
          <span><b>Status: </b>{status}</span>
        </div>
      );
    };
    
    export default CardRun;
