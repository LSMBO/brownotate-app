import "./CardRun.css"
import SettingsCard from "./SettingsCard"
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

const CardRun = ({ id, data, status, parameters }) => {
    const [cardExpanded, setCardExpanded] = useState(false);
    const [settingsExpanded, setSettingsExpanded] = useState(false);
  
    const handleCardExpand = () => {
        setCardExpanded(!cardExpanded);
    };

    const handleSettingsExpand = () => {
        setSettingsExpanded(!settingsExpanded);
    };
  
    let statusText;
    switch (status) {
      case "running":
        statusText = "Loading";
        break;
      case "completed":
        statusText = "Completed";
        break;
      case "error":
        statusText = "Run failed";
        break;
      default:
        statusText = "";
    }

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

      const renderParameters = (params) => {
        return Object.entries(params).map(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            return (
              <div key={key} className="parameter">
                <span className="parameter-title">{key} : </span>
                <ul className="parameter-list">
                  {value.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          } else if (typeof value === 'object' && value !== null) {
            return (
              <div key={key} className="parameter">
                <span className="parameter-title">{key} - </span>
                <div className="nested-parameters">
                  {renderParameters(value)}
                </div>
              </div>
            );
          } else {
            return (
              <div key={key} className="parameter">
                <span className="parameter-title">{key}</span>
                <span className="parameter-value">{String(value)}</span>
              </div>
            );
          }
        });
      };
    
      return (
        <div className={`run-card ${status}`}>
          <div className="run-header t1_bold" >
            <div>
              <span>{formatDate(id)}</span>
              <span className="t1_light"><i>{parameters.species?.scientificName}</i></span>
              <span className="t1_light">{statusText}</span>
            </div>
            <FontAwesomeIcon icon={cardExpanded ? faAngleUp : faAngleDown} className="expand-icon" onClick={handleCardExpand}/>
          </div>
          {cardExpanded && (
            <div className="run-details">
              <div className="section-header">
                <h2 className="t1_bold">Run settings</h2>
                <FontAwesomeIcon icon={settingsExpanded ? faAngleUp : faAngleDown} className="expand-icon" onClick={handleSettingsExpand}/>
              </div>
              {settingsExpanded && (
                <SettingsCard parameters={parameters}/>
              )}
            </div>
          )}
        </div>
      );
    };
    
    export default CardRun;