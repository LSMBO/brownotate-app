import DownloadContainer from './DownloadContainer';
import Busco from './Busco';
import Image from '../../components/Image';

function Results({ annotation, fileContents, setIsLoading }) {
	const parseDurationToSeconds = (timer) => {
		if (!timer || typeof timer !== 'string') return null;
		const parts = timer.split(':');
		if (parts.length < 3) return null;
		const hours = Number(parts[0] || 0);
		const minutes = Number(parts[1] || 0);
		const seconds = Number(parts[2] || 0);
		const millis = Number(parts[3] || 0);
		if ([hours, minutes, seconds, millis].some(Number.isNaN)) return null;
		return hours * 3600 + minutes * 60 + seconds + millis / 1000;
	};

	const formatClock = (unixSeconds) => {
		if (!unixSeconds) return '';
		const date = new Date(unixSeconds * 1000);
		if (Number.isNaN(date.getTime())) return '';
		return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	};

	const formatDuration = (seconds) => {
		if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return '';
		const whole = Math.max(0, Math.floor(seconds));
		const h = Math.floor(whole / 3600);
		const m = Math.floor((whole % 3600) / 60);
		const s = whole % 60;
		if (h > 0) return `${h}h ${m}m ${s}s`;
		if (m > 0) return `${m}m ${s}s`;
		return `${s}s`;
	};

	const progressKey = (label) => String(label || '').replace(/[^a-zA-Z0-9]/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
	const stepAliases = {
		'Removing short sequences from annotation according to the length filter ...': [
			'Removing short sequences from annotation ...'
		]
	};
	const aliasesFor = (stepName) => [stepName, ...(stepAliases[stepName] || [])];

	const getElapsedForStep = (stepName, resumeData) => {
		const map = {
			'Running fastp on sequencing files ...': 'fastp_timer',
			'Removing Phix from sequencing files ...': 'remove_phix_timer',
			'Running CANU assembly ...': 'canu_timer',
			'Running Megahit assembly ...': 'megahit_timer',
			'Running BUSCO on assembly ...': 'busco_assembly_timer',
			'Running Prokka annotation ...': 'prokka_timer',
			'Running Scipio ...': 'scipio_timer',
			'Running gene prediction model ...': 'model_timer',
			'Optimizing gene prediction model ...': 'optimize_model_timer',
			'Running Augustus annotation ...': 'augustus_timer',
			'Removing short sequences from annotation ...': 'remove_short_sequences_timer',
			'Removing short sequences from annotation according to the length filter ...': 'remove_short_sequences_timer',
			'Removing redundancy from annotation ...': 'remove_redundancy_timer',
			'Running Brownaming ...': 'brownaming_timer',
			'Running BUSCO on annotation ...': 'busco_annotation_timer',
		};

		const names = aliasesFor(stepName);
		const timerText = names
			.map((name) =>
				resumeData?.[map[name]] ||
				annotation?.timers?.[name] ||
				annotation?.timers?.[String(name || '').replace(/\./g, '')]
			)
			.find(Boolean);
		return parseDurationToSeconds(timerText);
	};

	const rawTimeline = (annotation?.stepList || []).map((step) => {
		const keys = aliasesFor(step.name).map((name) => progressKey(name));
		const start = keys.map((key) => annotation?.resumeData?.progress_started_at?.[key]).find(Boolean) || null;
		const end = keys.map((key) => annotation?.resumeData?.progress_finished_at?.[key]).find(Boolean) || null;
		let elapsed = getElapsedForStep(step.name, annotation?.resumeData || {});
		if ((elapsed === null || elapsed === undefined) && start && end && end >= start) {
			elapsed = end - start;
		}
		return {
			name: step.name,
			start,
			end,
			elapsed,
		};
	});

	const timeline = rawTimeline.map((row, index) => {
		const nextRow = rawTimeline[index + 1] || null;
		let derivedEnd = row.end;
		if (!derivedEnd && row.start && row.elapsed) {
			derivedEnd = row.start + row.elapsed;
		}
		// Fallback: if an explicit end is missing, use the next step start as boundary.
		if (!derivedEnd && row.start && nextRow?.start && nextRow.start >= row.start) {
			derivedEnd = nextRow.start;
		}

		let derivedElapsed = row.elapsed;
		if ((derivedElapsed === null || derivedElapsed === undefined) && row.start && derivedEnd && derivedEnd >= row.start) {
			derivedElapsed = derivedEnd - row.start;
		}

		return {
			...row,
			end: derivedEnd,
			elapsed: derivedElapsed,
		};
	});

	const totalRuntime = timeline.reduce((sum, row) => sum + (row.elapsed || 0), 0);

	const isFunctionalAnnotation = annotation.parameters.type === 'functional';
	const hasBrownamingResults = Boolean(fileContents.brownamingStatsFile || fileContents.brownamingLogFile || annotation.resumeData?.brownamingResults);

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
			
			{(!annotation.parameters.brownamingSection.skip && hasBrownamingResults) && (
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

			<fieldset>
				<legend className="t2_bold">Step Runtime Summary</legend>
				<div className="t2_light" style={{ overflowX: 'auto' }}>
					<table style={{ width: '100%', borderCollapse: 'collapse' }}>
						<thead>
							<tr>
								<th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #ddd' }}>Step</th>
								<th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #ddd' }}>Start</th>
								<th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #ddd' }}>End</th>
								<th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #ddd' }}>Elapsed</th>
							</tr>
						</thead>
						<tbody>
							{timeline.map((row) => (
								<tr key={row.name}>
									<td style={{ padding: '6px 8px', borderBottom: '1px solid #f0f0f0' }}>{row.name}</td>
									<td style={{ padding: '6px 8px', borderBottom: '1px solid #f0f0f0' }}>{formatClock(row.start)}</td>
									<td style={{ padding: '6px 8px', borderBottom: '1px solid #f0f0f0' }}>{formatClock(row.end)}</td>
									<td style={{ padding: '6px 8px', borderBottom: '1px solid #f0f0f0' }}>{formatDuration(row.elapsed)}</td>
								</tr>
							))}
						</tbody>
					</table>
					<div style={{ marginTop: '10px' }}><b>Total:</b> {formatDuration(totalRuntime)}</div>
				</div>
			</fieldset>
		</div>
	)
}

export default Results