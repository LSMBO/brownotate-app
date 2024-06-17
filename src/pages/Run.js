import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { handleClickDownload } from '../utils/Download';
import { displayFile } from '../utils/DisplayFile';
import './Run.css';
import DownloadIcon from "../assets/download.png";

const Run = () => {
    const { id } = useParams();
    const [run, setRun] = useState(null);
	const [logFile, setLogFile] = useState(null);
    const [fileContents, setFileContents] = useState({
        logFile: null,
        buscoAssemblyFile: null,
        buscoAnnotationFile: null,
        brownamingStatsFile: null
    });

    useEffect(() => {
        const fetchRun = async () => {
            try {
                const response = await axios.post('http://134.158.151.129:80/get_run', { run_id: id });
                const data = response.data;
                if (data.status === 'success') {
                    setRun(data.run);
                } else {
                    console.error(data.message);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchRun();
    }, [id]);

	useEffect(() => {
        const handleDisplayFile = async (filePath, fileType) => {
            try {
                const fileContent = await displayFile(filePath);
                setFileContents(prevState => ({
                    ...prevState,
                    [fileType]: fileContent
                }));
            } catch (error) {
                console.error(`Error fetching ${fileType} file:`, error);
            }
        };

        if (run) {
            handleDisplayFile(`${run.results_path}/Busco_genome.json`, 'buscoAssemblyFile');
			handleDisplayFile(`${run.results_path}/Busco_annotation.json`, 'buscoAnnotationFile');
			handleDisplayFile(`${run.results_path}/brownaming/stats.txt`, 'brownamingStatsFile');
			handleDisplayFile(`${run.results_path}/main.log`, 'logFile');
        }
    }, [run]);

    const getDuplicationMethod = () => {
        if (run.parameters.startSection.removeStrict) {
            return '100% Identity - Same length';
        } else if (run.parameters.startSection.removeSoft) {
            return '100% Identity - lower length';
        } else {
            return 'All sequences are conserved';
        }
    };

	const getExcludedSpeciesList = () => {
		if (run.parameters.brownamingSection.excludedSpeciesList.length > 0) {
			return (
				<div>
					{run.parameters.brownamingSection.excludedSpeciesList.map((item, index) => (
						<div className="value" key={index}>- {item[0]}</div>
					))}
				</div>
			);
		} else {
			return 'None'
		}
	}

	const listDisplay = (list) => {
        return (
            <div>
                {list.map((item, index) => (
                    <div className="value" key={index}>- {item}</div>
                ))}
            </div>
        );
    };

    const handleDisplayFile = async (filePath, fileType) => {
        try {
            const fileContent = await displayFile(filePath);
            setFileContents(prevState => ({
                ...prevState,
                [fileType]: fileContent
            }));
        } catch (error) {
            console.error(`Error fetching ${fileType} file:`, error);
        }
    };

    return (
        <div>
            {run ? (
                <div className='t2_light'>
					<div className="run-results">
						<h3>Results</h3>
						<fieldset className='download-container'>
							<legend className="t2_bold">Download</legend>
							<div className='download'>
								<div className="t2_light" onClick={() => handleClickDownload(`${run.results_path}`, 'server')}>All (zipped)</div>
								<img src={DownloadIcon} alt="download" className="downloadIcon"/>
							</div>
							<div className='download'>
								<div className="t2_light" onClick={() => handleClickDownload(`${run.results_path}/genome`, 'server', '.fasta')}>Assembly</div>
								<img src={DownloadIcon} alt="download" className="downloadIcon"/>
							</div>
							<div className='download'>
								<div className="t2_light" onClick={() => handleClickDownload(`${run.results_path}`, 'server', '.fasta')}>Annotation</div>
								<img src={DownloadIcon} alt="download" className="downloadIcon"/>
							</div>
							<div className='download'>
								<div className="t2_light" onClick={() => handleClickDownload(`${run.results_path}/brownaming`, 'server')}>Brownaming (zipped)</div>
								<img src={DownloadIcon} alt="download" className="downloadIcon"/>
							</div>
						</fieldset>
						<fieldset>
							<legend className="t2_bold">Busco</legend>
							{run.parameters.buscoSection.assembly &&
							<div>
								<h4>Assembly completeness</h4>
								<div className="t2_light file-content">
									{fileContents.buscoAssemblyFile ? fileContents.buscoAssemblyFile : (
										<div>Loading...</div>
									)}
								</div>
							</div>}
							{run.parameters.buscoSection.annotation &&
							<div>
								<h4>Annotation completeness</h4>
								<div className="t2_light file-content">
									{fileContents.buscoAnnotationFile ? fileContents.buscoAnnotationFile : (
										<div>Loading...</div>
									)}
								</div>
							</div>}
						</fieldset>
						<fieldset>
                            <legend className="t2_bold">Brownaming statistics</legend>
                            <div className="t2_light">
                                {fileContents.brownamingStatsFile ? fileContents.brownamingStatsFile : (
                                    <div>Loading...</div>
                                )}
                            </div>
                        </fieldset>
                        <fieldset>
                            <legend className='t2_bold'>Log</legend>
                            <div className="t2_light">
                                {fileContents.logFile ? fileContents.logFile : (
                                    <div>Loading...</div>
                                )}
                            </div>
                        </fieldset>
                    </div>
                    <div className="run-parameters">
                        <h3>Selected parameters</h3>
						<fieldset>
							<legend className="t2_bold">Started data</legend>
							<div className='item'>
								<div className="label">Mode</div>
								<div className="value">{run.parameters.startSection.genome ? 'Genome' : 'Sequencing'}</div>
							</div>
							{run.parameters.startSection.sequencingFiles &&
								<div className='item'>
									<div className="label">Sequencing file(s)</div>
									<div className="value">{listDisplay(run.parameters.startSection.sequencingFilesList)}</div>
								</div>}
							{run.parameters.startSection.sequencingAccessions &&
								<div className='item'>
									<div className="label">Sequencing accession(s)</div>
									<div className="value">{listDisplay(run.parameters.startSection.sequencingAccessionsList)}</div>
								</div>}
							{run.parameters.startSection.genomeFile &&
								<div className='item'>
									<div className="label">Assembly file</div>
									<div className="value">{run.parameters.startSection.genomeFileList}</div>
								</div>}
							{run.parameters.startSection.sequencing &&
							<div className='item'>
								<div className="label">Skip fastp</div>
								<div className="value">{run.parameters.startSection.skipFastp ? 'True' : 'False'}</div>
							</div>}
							{run.parameters.startSection.sequencing &&
							<div className='item'>
								<div className="label">Skip phix removing</div>
								<div className="value">{run.parameters.startSection.skipPhix ? 'True' : 'False'}</div>
							</div>
							}
						</fieldset>
						<fieldset>
							<legend className="t2_bold">Annotation parameters</legend>
							<div className='item'>
									<div className="label">Automatic evidence selection</div>
									<div className="value">{run.parameters.startSection.evidenceAuto ? 'True' : 'False'}</div>
							</div>
							{run.parameters.annotationSection.evidenceFileList &&
								<div className='item'>
									<div className="label">Evidence file</div>
									<div className="value">{run.parameters.annotationSection.evidenceFileList}</div>
								</div>}
							<div className='item'>
									<div className="label">Removed duplicated sequences</div>
									<div className="value">{getDuplicationMethod()}</div>
							</div>
						</fieldset>
						<fieldset>
							<legend className="t2_bold">Brownaming parameters</legend>
							<div className='item'>
									<div className="label">Skip Brownaming</div>
									<div className="value">{run.parameters.brownamingSection.skip ? 'True' : 'False'}</div>
							</div>
							{!run.parameters.brownamingSection.skip &&
								<div className='item'>
									<div className="label">Excluded species</div>
									<div className="value">{getExcludedSpeciesList()}</div>
							</div>}
							{!run.parameters.brownamingSection.skip &&
								<div className='item'>
									<div className="label">Highest taxa rank</div>
									<div className="value">{run.parameters.brownamingSection.highestRank}</div>
							</div>}	
						</fieldset>
						<fieldset>
							<legend className="t2_bold">Busco parameters</legend>
							<div className='item'>
									<div className="label">Evaluate the assembly completeness</div>
									<div className="value">{run.parameters.buscoSection.assembly ? 'True' : 'False'}</div>
							</div>
							<div className='item'>
									<div className="label">Evaluate the annotation completeness</div>
									<div className="value">{run.parameters.buscoSection.annotation ? 'True' : 'False'}</div>
							</div>
						</fieldset>
					</div>
                </div>
            ) : (
                <div></div>
            )}
        </div>
    );
};

export default Run;
