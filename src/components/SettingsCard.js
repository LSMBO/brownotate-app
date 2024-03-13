import "./CardRun.css"
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';

const SettingsCard = ({ parameters }) => {

    const [startSectionExpanded, setStartSectionExpanded] = useState(false);
    const [dataSectionExpanded, setDataSectionExpanded] = useState(false);
    const [assemblySectionExpanded, setAssemblySectionExpanded] = useState(false);
    const [annotationSectionExpanded, setAnnotationSectionExpanded] = useState(false);
    const [brownamingSectionExpanded, setBrownamingSectionExpanded] = useState(false);
    const [buscoSectionExpanded, setBuscoSectionExpanded] = useState(false);


    return (
        <div>
            <div className="section-header">
                <h2 className="t1_bold">Start</h2>
                <FontAwesomeIcon icon={startSectionExpanded ? faAngleUp : faAngleDown} className="expand-icon" onClick={() => setStartSectionExpanded(!startSectionExpanded)}/>
            </div>
            {startSectionExpanded && (
            <div>
                <span className="t1_light">Auto : {parameters.startSection.auto ? 'True' : 'False'}</span>
                <span className="t1_light">Genome : {parameters.startSection.genome ? 'True' : 'False'}</span>
                <span className="t1_light">Sequencing : {parameters.startSection.sequencing ? 'True' : 'False'}</span>
            </div>
            )}
            <div className="section-header">
                <h2 className="t1_bold">Data</h2>
                <FontAwesomeIcon icon={dataSectionExpanded ? faAngleUp : faAngleDown} className="expand-icon" onClick={() => setDataSectionExpanded(!dataSectionExpanded)}/>
            </div>
            {dataSectionExpanded && (
            <div>
                <span className="t1_light">
                    Genome file : {
                        parameters.dataSection.genomeFileList.length > 0
                        ? parameters.dataSection.genomeFileList.map(file => file.name).join(', ')
                        : 'False'
                    }
                </span>

                <span className="t1_light">Penome file : {parameters.dataSection.genomeFileList}</span>
                <span className="t1_light">Sequencing file(s) : {parameters.dataSection.sequencingFilesList}</span>
                <span className="t1_light">SRA accessions : {parameters.dataSection.sequencingAccessionsList}</span>
            </div>
            )}
       
        </div>
    )
};

export default SettingsCard;