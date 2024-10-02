import React from 'react'

function Busco({ run, fileContents }) {
	return (
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
			{(run.status === "completed" && run.parameters.buscoSection.annotation) &&
				<div>
					<h4>Annotation completeness</h4>
					<div className="t2_light file-content">
						{fileContents.buscoAnnotationFile ? fileContents.buscoAnnotationFile : (
							<div>Loading...</div>
						)}
					</div>
				</div>}
		</fieldset>
	)
}

export default Busco