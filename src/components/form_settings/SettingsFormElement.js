import SettingsExcludedSpecies from "./SettingsExcludedSpecies";
import HelpIcon from "../../assets/help.png";
import { useState } from "react";

export default function SettingsFormElement({ name, type, help, checked, onRadioChange }){
    //props
    const [helpHovered, setHelpHovered] = useState(false);


    //comportement
    const handleCheck = () => {
      onRadioChange(name);
    }

    //affichage
    return (
      <div className="formElement">
          {type === 'excluded_species' ? (
              <SettingsExcludedSpecies />
          ) : (
              <div className={`radioLabel${type === 'radio_only' ? ' radioOnly' : ''} ${checked ? 't1_bold' : ''}`}>
                  <input type="radio" onChange={handleCheck} checked={checked} />
                  <label>{name}</label>
                  <img 
                    src={HelpIcon} 
                    alt="help" 
                    className="helpIcon"
                    onMouseEnter={() => setHelpHovered(true)}
                    onMouseLeave={() => setHelpHovered(false)}
                  />
                  {helpHovered && <span className="helpSpan">{help}</span>}
              </div>
          )}
          {type === 'text' && <input type="text" name={name.toLowerCase()} />}
          {type === 'file' && (
              <input
                  className="t1_light"
                  type="file"
                  name={name.toLowerCase().replace(' ', '_')}
                  accept=".fastq, .fq"
                  multiple
              />
          )}
      </div>
  );
}