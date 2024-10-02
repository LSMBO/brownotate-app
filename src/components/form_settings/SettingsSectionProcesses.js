import HelpIcon from "../../assets/help.png";
import DisplayCPUs from "../DisplayCPUs";
import { useRuns } from '../../contexts/RunsContext'
import SettingsFormElementInputText from "./SettingsFormElementInputText";

export default function SettingsSectionProcesses({ updateParameters, parameters, freeCPUs }) {
	const { totalCPUs, usedCPUs } = useRuns();

	const handleCPUsChange = (text) => {
        const parametersCopy = { ...parameters };
        parametersCopy.cpus = text;
        updateParameters(parametersCopy)
      }

    return (
        <fieldset>
            <legend className="t2_bold">Computational resource management</legend>
			<DisplayCPUs totalCPUs={totalCPUs} usedCPUs={usedCPUs} variant='settings' />

			<div className="formSection">
              <div className="sectionTitle">
                  <div className="labelTooltipWrapper">
                    <label>CPUs</label>
                    <div className="tooltipContainer">
                      <img src={HelpIcon} alt="help" className="helpIcon" />
                      <span className="helpSpan">Number of cpus used for the analysis</span>
                    </div>
                  </div>
              </div>
			  <div className="formElement">
                  <SettingsFormElementInputText 
                    label="CPUs"
                    text={parameters.cpus} 
                    onChange={handleCPUsChange}
                    type='input-number'
                    width='5'
					          max={freeCPUs}/>
              </div>
            </div>
        </fieldset>
    )
}
