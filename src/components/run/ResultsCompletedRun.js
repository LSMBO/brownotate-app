import React from 'react';
import DownloadContainer from './DownloadContainer';
import Busco from './Busco';

function ResultsCompletedRun({ run, fileContents, setIsLoading }) {
	return (
		<div className="run-results">
			<h3>Results</h3>
			<DownloadContainer run={run} setIsLoading={setIsLoading} />
			{run.status === "incomplete" && (
				<fieldset>
					<legend className="t2_bold">Annotation Failed</legend>
					<div className="t2_light">
						The annotation process has failed due to an insufficient number of genes identified.
						This could be caused by poor alignment of the evidences {run.parameters.annotationSection.evidenceFileList} with the assembly.
						We recommend trying again with improved genomic data or better evidences.
					</div>
				</fieldset>
			)}
			<Busco run={run} fileContents={fileContents} />
			{(run.status === "completed" && !run.parameters.brownamingSection.skip) &&
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
			<fieldset>
				<legend className='t2_bold'>Log</legend>
				<div className="t2_light">
					{fileContents.logFile ? fileContents.logFile : (
						<div>Loading...</div>
					)}
				</div>
			</fieldset>
			<fieldset>
              <legend className="t2_bold">std.out</legend>
              <pre>{run.stdout}</pre>
            </fieldset>
		</div>
	)
}

export default ResultsCompletedRun