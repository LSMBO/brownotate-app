import React from 'react'

function parseBuscoData(buscoData) {
	if (!buscoData) {
		return null;
	}

	if (buscoData.results) {
		const completePercent = Number(buscoData.results["Complete percentage"]);
		const singleCopyPercent = Number(buscoData.results["Single copy percentage"]);
		const multiCopyPercent = Number(buscoData.results["Multi copy percentage"]);
		const fragmentedPercent = Number(buscoData.results["Fragmented percentage"]);
		const missingPercent = Number(buscoData.results["Missing percentage"]);
		const total = Number(buscoData.lineage_dataset?.number_of_buscos || buscoData.results.n_markers || 0);
		const lineage = buscoData.lineage_dataset?.name || buscoData.results.domain || 'Unknown lineage';

		if ([singleCopyPercent, multiCopyPercent, fragmentedPercent, missingPercent].some(Number.isNaN)) {
			return null;
		}

		return {
			completePercent,
			singleCopyPercent,
			multiCopyPercent,
			fragmentedPercent,
			missingPercent,
			total,
			lineage
		};
	}

	if (buscoData.scores) {
		const completePercent = Number(buscoData.scores.C);
		const singleCopyPercent = Number(buscoData.scores.S);
		const multiCopyPercent = Number(buscoData.scores.D);
		const fragmentedPercent = Number(buscoData.scores.F);
		const missingPercent = Number(buscoData.scores.M);
		const total = Number(buscoData.scores.n || 0);
		const lineage = buscoData.lineage_dataset?.name || 'Unknown lineage';

		if ([singleCopyPercent, multiCopyPercent, fragmentedPercent, missingPercent].some(Number.isNaN)) {
			return null;
		}

		return {
			completePercent,
			singleCopyPercent,
			multiCopyPercent,
			fragmentedPercent,
			missingPercent,
			total,
			lineage
		};
	}

	return null;
}

function BuscoChart({ data }) {
	return (
		<div>
			<div className="legend">
				<div className="legend-item">
					<span className="legend-color" style={{ backgroundColor: '#aacc30' }}></span>
					<span>Single-copy</span>
				</div>
				<div className="legend-item">
					<span className="legend-color" style={{ backgroundColor: '#137c6e' }}></span>
					<span>Multi-copy</span>
				</div>
				<div className="legend-item">
					<span className="legend-color" style={{ backgroundColor: '#eca15b' }}></span>
					<span>Fragmented</span>
				</div>
				<div className="legend-item">
					<span className="legend-color" style={{ backgroundColor: '#2604bd' }}></span>
					<span>Missing</span>
				</div>
			</div>

			<div className="busco-bar">
				<div className="busco-segment" style={{ width: `${data.singleCopyPercent}%`, backgroundColor: '#aacc30' }}></div>
				<div className="busco-segment" style={{ width: `${data.multiCopyPercent}%`, backgroundColor: '#137c6e' }}></div>
				<div className="busco-segment" style={{ width: `${data.fragmentedPercent}%`, backgroundColor: '#eca15b' }}></div>
				<div className="busco-segment" style={{ width: `${data.missingPercent}%`, backgroundColor: '#2604bd' }}></div>
			</div>

			<div className="busco-stats">
				<div>n:{data.total} · {data.lineage}</div>
				<div className="busco-percentages">
					<span style={{ fontWeight: 'bold' }}>C:{data.completePercent.toFixed(1)}%</span>
					&nbsp;(S:{data.singleCopyPercent.toFixed(1)}% D:{data.multiCopyPercent.toFixed(1)}%)
					&nbsp;F:{data.fragmentedPercent.toFixed(1)}% M:{data.missingPercent.toFixed(1)}%
				</div>
			</div>
		</div>
	);
}

function Busco({ annotation, fileContents }) {
	const assemblyData = parseBuscoData(annotation.resumeData?.busco_assembly_result);
	const annotationData = parseBuscoData(annotation.resumeData?.busco_annotation_result);

	const assemblyContent = fileContents.buscoAssemblyFile || annotation.resumeData?.busco_assembly_result?.raw_summary;
	const annotationContent = fileContents.buscoAnnotationFile || annotation.resumeData?.busco_annotation_result?.raw_summary;

	const showAssembly = Boolean(annotation.parameters.buscoSection?.assembly && (assemblyData || assemblyContent));
	const showAnnotation = Boolean(annotation.parameters.buscoSection?.annotation && (annotationData || annotationContent));

	if (!showAssembly && !showAnnotation) {
		return null;
	}

	return (
		<fieldset>
			<legend className="t2_bold">Busco</legend>
			{showAssembly &&
				<div>
					<h4>Assembly completeness</h4>
					<div className="t2_light file-content">
						{React.isValidElement(fileContents.buscoAssemblyFile)
							? fileContents.buscoAssemblyFile
							: (assemblyData
								? <BuscoChart data={assemblyData} />
								: assemblyContent)}
					</div>
				</div>}
			{showAnnotation &&
				<div>
					<h4>Annotation completeness</h4>
					<div className="t2_light file-content">
						{React.isValidElement(fileContents.buscoAnnotationFile)
							? fileContents.buscoAnnotationFile
							: (annotationData
								? <BuscoChart data={annotationData} />
								: annotationContent)}
					</div>
				</div>}
		</fieldset>
	)
}

export default Busco