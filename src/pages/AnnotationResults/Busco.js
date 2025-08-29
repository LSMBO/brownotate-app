import React from 'react'

function Busco({ annotation, fileContents }) {
	return (
		<fieldset>
			<legend className="t2_bold">Busco</legend>
			{annotation.parameters.buscoSection.assembly &&
				<div>
					<h4>Assembly completeness</h4>
					<div className="t2_light file-content">
						{fileContents.buscoAssemblyFile ? fileContents.buscoAssemblyFile : (
							<div>Loading...</div>
						)}
					</div>
				</div>}
			{(annotation.status === "completed" && annotation.parameters.buscoSection.annotation) &&
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