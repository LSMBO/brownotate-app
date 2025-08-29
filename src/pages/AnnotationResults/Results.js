import React from 'react';
import DownloadContainer from './DownloadContainer';
import Busco from './Busco';

function Results({ annotation, fileContents, setIsLoading }) {
	return (
		<div className="run-results">
			<h3>Results</h3>
			<DownloadContainer annotation={annotation} setIsLoading={setIsLoading} />
			{annotation.status === "incomplete" && (
				<fieldset>
					<legend className="t2_bold">Annotation Failed</legend>
					<div className="t2_light">
						The annotation process has failed due to an insufficient number of genes identified.
						This could be caused by poor alignment of the evidences {annotation.parameters.annotationSection.evidenceFileList} with the assembly.
						We recommend trying again with improved genomic data or better evidences.
					</div>
				</fieldset>
			)}
			<Busco annotation={annotation} fileContents={fileContents} />
			{(annotation.status === "completed" && !annotation.parameters.brownamingSection.skip) &&
				<fieldset>
					<legend className="t2_bold">Brownaming statistics</legend>
					<div className="t2_light">
						{fileContents.brownamingStatsFile ?
							fileContents.brownamingStatsFile : (
								<div>Loading...</div>
							)}
					</div>
				</fieldset>
			}
		</div>
	)
}

export default Results