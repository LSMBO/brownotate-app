import React from 'react'
import { handleClickDownload } from '../../utils/Download';
import DownloadIcon from "../../assets/download.png"

function DownloadContainer({ run, setIsLoading }) {
	return (
		<fieldset className='download-container'>
			<legend className="t2_bold">Download</legend>
			<div className='download' onClick={() => handleClickDownload(`${run.results_path}`, 'server', setIsLoading)}>
				<div className="t2_light">All (zipped)</div>
				<img src={DownloadIcon} alt="download" className="downloadIcon" />
			</div>
			<div className='download' onClick={() => handleClickDownload(`${run.results_path}/genome`, 'server', setIsLoading, '.fasta')}>
				<div className="t2_light">Assembly</div>
				<img src={DownloadIcon} alt="download" className="downloadIcon" />
			</div>
			<div className={`download ${run.status === "incomplete" ? 'disabled' : ''}`} onClick={run.status === "completed" ? () => handleClickDownload(`${run.results_path}`, 'server', setIsLoading, '.fasta') : null}>
				<div className="t2_light">Annotation</div>
				<img src={DownloadIcon} alt="download" className="downloadIcon" />
			</div>
			<div className={`download ${run.status === "incomplete" ? 'disabled' : ''}`} onClick={run.status === "completed" ? () => handleClickDownload(`${run.results_path}/brownaming`, 'server', setIsLoading) : null}>
				<div className="t2_light">Brownaming (zipped)</div>
				<img src={DownloadIcon} alt="download" className="downloadIcon" />
			</div>
		</fieldset>
	)
}

export default DownloadContainer