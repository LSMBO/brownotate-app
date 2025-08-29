import React from 'react'
import { downloadFromServer } from '../../utils/Download';
import DownloadIcon from "../../assets/download.png"



function DownloadContainer({ annotation, setIsLoading }) {

	const handleClickDownload = async (path, extension) => {
		console.log('download container download', path, extension);
		setIsLoading(true);
		await downloadFromServer(path, extension);
		setIsLoading(false);
	}

	return (
		<fieldset className='download-container'>
			<legend className="t2_bold">Download</legend>
			<div className='download' onClick={() => handleClickDownload(`${annotation.results_path}`, null)}>
				<div className="t2_light">All (zipped)</div>
				<img src={DownloadIcon} alt="download" className="downloadIcon" />
			</div>
			{annotation.parameters.startSection.assembly ? (
				<div className='download' onClick={() => handleClickDownload(annotation.parameters.startSection.assemblyFileOnServer)}>
					<div className="t2_light">Assembly</div>
					<img src={DownloadIcon} alt="download" className="downloadIcon" />
				</div>
			) : (
				<div className='download' onClick={() => handleClickDownload(`${annotation.results_path}/genome`, '.fasta')}>
					<div className="t2_light">Assembly</div>
					<img src={DownloadIcon} alt="download" className="downloadIcon" />
				</div>
			)}			
			<div className={`download ${annotation.status === "incomplete" ? 'disabled' : ''}`} onClick={annotation.status === "completed" ? () => handleClickDownload(`${annotation.results_path}`, '.fasta') : null}>
				<div className="t2_light">Annotation</div>
				<img src={DownloadIcon} alt="download" className="downloadIcon" />
			</div>
			<div className={`download ${annotation.status === "incomplete" ? 'disabled' : ''}`} onClick={annotation.status === "completed" ? () => handleClickDownload(`${annotation.results_path}/brownaming`) : null}>
				<div className="t2_light">Brownaming (zipped)</div>
				<img src={DownloadIcon} alt="download" className="downloadIcon" />
			</div>
		</fieldset>
	)
}

export default DownloadContainer