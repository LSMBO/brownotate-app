import React from 'react'

function ResultsFailedRun({ run }) {
	return (
		<div className="run-error-message">
			<h3>Error</h3>
			<fieldset>
				<legend className="t2_bold">std.out</legend>
				<pre>{run.stdout}</pre>
			</fieldset>
			<fieldset>
				<legend className="t2_bold">std.err</legend>
				<pre>{run.stderr}</pre>
			</fieldset>
		</div>
	)
}

export default ResultsFailedRun