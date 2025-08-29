
import HelpIcon from "../../assets/help.png";

export default function FormElementInputRadio({ disabled, label, help, checked, onChange }) {


    const handleClick = () => {
        new Promise((resolve) => {
            onChange(label, !checked);
          resolve();
        })
      };
    
    return (
      <div className={`radio-label${checked ? ' t2_bold' : ''}`}>
          <input disabled={disabled} type="radio" onChange={() => {}} onClick={handleClick} checked={checked} />
          <div className="label-tooltip-wrapper">
              <label>{label}</label>
              <div className="tooltip-container">
                  <img src={HelpIcon} alt="help" className="helpIcon"/>
                  <span className="help-span">{help}</span>
              </div>
          </div>
      </div>
    )
}