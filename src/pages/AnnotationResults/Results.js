import DownloadContainer from './DownloadContainer';
import Busco from './Busco';
import Image from '../../components/Image';

function Results({ annotation, fileContents, setIsLoading }) {
	const isFunctionalAnnotation = annotation.parameters.type === 'functional';

	return (
		<div className="run-results">
			<DownloadContainer annotation={annotation} setIsLoading={setIsLoading} />
			
			{!isFunctionalAnnotation && annotation.status === "incomplete" && (
				<fieldset>
					<legend className="t2_bold">Annotation Failed</legend>
					<div className="t2_light">
						The annotation process has failed due to an insufficient number of genes identified.
						This could be caused by poor alignment of the evidences {annotation.parameters.annotationSection.evidenceFileList} with the assembly.
						We recommend trying again with improved genomic data or better evidences.
					</div>
				</fieldset>
			)}
			
			{!isFunctionalAnnotation && <Busco annotation={annotation} fileContents={fileContents} />}
			
			{(annotation.status === "completed" && !annotation.parameters.brownamingSection.skip) && (
				<fieldset>
					<legend className="t2_bold">Brownaming Results</legend>
					<div className="t2_light">
						{fileContents.brownamingStatsFile && (
							<div style={{marginBottom: '20px'}}>
								<h4>Statistics</h4>
								<Image file={fileContents.brownamingStatsFile} />
							</div>
						)}

						{fileContents.brownamingLogFile && (
							<div>
								<h4>Brownaming Log</h4>
								<div className="file-content" style={{
									backgroundColor: '#f5f5f5', 
									padding: '15px', 
									borderRadius: '8px',
									maxHeight: '400px',
									overflowY: 'auto',
									fontFamily: 'monospace',
									fontSize: '0.9em'
								}}>
									<pre style={{margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
										{fileContents.brownamingLogFile}
									</pre>
								</div>
							</div>
						)}
						
						{(!fileContents.brownamingStatsFile && !fileContents.brownamingLogFile) && (
							<div>Loading Brownaming results...</div>
						)}
					</div>
				</fieldset>
			)}
		</div>
	)
}

export default Results