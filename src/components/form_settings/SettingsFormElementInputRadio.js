
import HelpIcon from "../../assets/help.png";

export default function SettingsFormElementInputRadio({ disabled, label, help, checked, onChange }) {


    const handleClick = () => {
        new Promise((resolve) => {
            onChange(label, !checked);
          resolve();
        })
      };
    
    return (
      <div className={`radioLabel ${checked ? 't2_bold' : ''}`}>
          <input disabled={disabled} type="radio" onChange={() => {}} onClick={handleClick} checked={checked} />
          <div className="labelTooltipWrapper">
              <label>{label}</label>
              <div className="tooltipContainer">
                  <img src={HelpIcon} alt="help" className="helpIcon"/>
                  <span className="helpSpan">{help}</span>
              </div>
          </div>
      </div>
    )
}