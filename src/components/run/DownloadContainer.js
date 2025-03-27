import React from 'react'
import { downloadFromServer } from '../../utils/Download';
import DownloadIcon from "../../assets/download.png"


function DownloadContainer({ run, setIsLoading }) {

	const handleClickDownload = async (path, extension) => {
		console.log('download container download', path, extension);
		setIsLoading(true);
		await downloadFromServer(path, extension);
		setIsLoading(false);
	}

	return (
		<fieldset className='download-container'>
			<legend className="t2_bold">Download</legend>
			<div className='download' onClick={() => handleClickDownload(`${run.results_path}`, null)}>
				<div className="t2_light">All (zipped)</div>
				<img src={DownloadIcon} alt="download" className="downloadIcon" />
			</div>
			<div className='download' onClick={() => handleClickDownload(`${run.results_path}/genome`, '.fasta')}>
				<div className="t2_light">Assembly</div>
				<img src={DownloadIcon} alt="download" className="downloadIcon" />
			</div>
			<div className={`download ${run.status === "incomplete" ? 'disabled' : ''}`} onClick={run.status === "completed" ? () => handleClickDownload(`${run.results_path}`, '.fasta') : null}>
				<div className="t2_light">Annotation</div>
				<img src={DownloadIcon} alt="download" className="downloadIcon" />
			</div>
			<div className={`download ${run.status === "incomplete" ? 'disabled' : ''}`} onClick={run.status === "completed" ? () => handleClickDownload(`${run.results_path}/brownaming`) : null}>
				<div className="t2_light">Brownaming (zipped)</div>
				<img src={DownloadIcon} alt="download" className="downloadIcon" />
			</div>
		</fieldset>
	)
}

export default DownloadContainer