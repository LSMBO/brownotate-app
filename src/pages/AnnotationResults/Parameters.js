import ParameterItem from './ParameterItem';

function Parameters({ annotation, functionalAnnotationRun=false }) {

	const listDisplay = (list) => {
		if (!Array.isArray(list)) {
			return list;
		}
		return (
			<div>
				{list.map((item, index) => (
					<div className="value" key={index}>- {item}</div>
				))}
			</div>
		);
	};


	const getDuplicationMethod = () => {
		if (!annotation.parameters.annotationSection) return 'N/A';
        if (annotation.parameters.annotationSection.removeStrict) {
            return '100% Identity - Same length';
        } else if (annotation.parameters.annotationSection.removeSoft) {
            return '100% Identity - lower length';
        } else {
            return 'All sequences are conserved';
        }
    };

	const getExcludedSpeciesList = () => {
		const excludedList = annotation.parameters.brownamingSection.excludedTaxoList || 
							 annotation.parameters.brownamingSection.excludedSpeciesList;
		if (excludedList && excludedList.length > 0) {
			return (
				<div>
					{excludedList.map((item, index) => (
						<div className="value" key={item.taxid || item.taxID || index}>
							{item.scientific_name || item.scientificName} ({item.taxid || item.taxID})
						</div>
					))}
				</div>
			);
		} else {
			return 'None'
		}
	}

	const getLastTaxid = () => {
		const lastTaxid = annotation.parameters.brownamingSection.lastTaxid;
		if (!lastTaxid) return 'None';
		
		// Find in lineage if available
		const lineage = annotation.parameters.species?.lineage || [];
		const taxon = lineage.find(t => t.taxonId === lastTaxid);
		
		if (taxon) {
			return `${taxon.scientificName} (taxID: ${taxon.taxonId} | rank: ${taxon.rank})`;
		}
		return lastTaxid;
	};

	return (
		<div className="run-parameters">
			
			{functionalAnnotationRun && (
				<fieldset>
					<legend className="t2_bold">Protein Input</legend>
					{annotation.parameters.proteinFileOnServer && (
						<ParameterItem label='Protein file' value={annotation.parameters.proteinFileOnServer} />
					)}
					{annotation.parameters.proteinFileAccession && (
						<ParameterItem label='Protein accession' value={annotation.parameters.proteinFileAccession} />
					)}
				</fieldset>
			)}

			{!functionalAnnotationRun && annotation.parameters.startSection && (
				<fieldset>
					<legend className="t2_bold">Started data</legend>
					<ParameterItem label='Mode' value={annotation.parameters.startSection.assembly ? 'Assembly' : 'Sequencing'} />
					{annotation.parameters.startSection.sequencingFiles &&
						<ParameterItem label='Sequencing file(s)' value={listDisplay(annotation.parameters.startSection.sequencingFileListOnServer)} />
					}
					{annotation.parameters.startSection.sequencingRuns &&
						<ParameterItem label='Sequencing accession(s)' value={listDisplay(annotation.parameters.startSection.sequencingRunList.map(run => `${run.accession} (${run.platform})`))} />
					}
					{annotation.parameters.startSection.sequencing && annotation.parameters.startSection.sequencing.depth !== undefined &&
						<ParameterItem label='Sequencing coverage' value={`${annotation.parameters.startSection.sequencing.depth.toFixed(1)}×`} />
					}
					{annotation.parameters.startSection.assemblyFile &&
						<ParameterItem label="Assembly file" value={annotation.parameters.startSection.assemblyFileOnServer} />
					}
					{annotation.parameters.startSection.assemblyAccession &&
						<ParameterItem label="Assembly accession" value={annotation.parameters.startSection.assemblyAccession} />
					}
					{annotation.parameters.startSection.sequencing && annotation.parameters.assemblySection?.megahit && (
						<>
							<ParameterItem label="Run fastp" value={annotation.parameters.assemblySection.runFastp ? 'True' : 'False'} />
							<ParameterItem label="Run Bowtie2 (PhiX removal)" value={annotation.parameters.assemblySection.runBowtie2 ? 'True' : 'False'} />
						</>
					)}
				</fieldset>
			)}

			{!functionalAnnotationRun && annotation.parameters.annotationSection && (
				<fieldset>
					<legend className="t2_bold">Annotation parameters</legend>
					{!annotation.parameters.species.is_bacteria && (
						<>
							<ParameterItem label="Automatic evidence selection" value={annotation.parameters.annotationSection.autoEvidence ? 'True' : 'False'} />
							{!annotation.parameters.annotationSection.autoEvidence && (
								<ParameterItem label="Evidence files" value={listDisplay(annotation.parameters.annotationSection.evidenceFileOnServer)} />
							)}
						</>
					)}
					
					<ParameterItem label="Remove duplicate sequences" value={getDuplicationMethod()} />
					<ParameterItem label="Minimal sequence length" value={annotation.parameters.annotationSection.minLength} />
				</fieldset>
			)}

			<fieldset>
				<legend className="t2_bold">Brownaming parameters</legend>
				<ParameterItem label="Skip Brownaming" value={annotation.parameters.brownamingSection.skip ? 'True' : 'False'} />
				{!annotation.parameters.brownamingSection.skip && (
					<>
						<ParameterItem label="Excluded species" value={getExcludedSpeciesList()} />
						<ParameterItem label="Taxonomic Expansion Limit" value={getLastTaxid()} />
						<ParameterItem label="Exclude trEMBL" value={annotation.parameters.brownamingSection.excludeTrembl ? 'True' : 'False'} />
					</>
				)}
			</fieldset>

			{!functionalAnnotationRun && annotation.parameters.buscoSection && (
				<fieldset>
					<legend className="t2_bold">Busco parameters</legend>
					<ParameterItem label="Evaluate the assembly completeness" value={annotation.parameters.buscoSection.assembly ? 'True' : 'False'} />
					<ParameterItem label="Evaluate the annotation completeness" value={annotation.parameters.buscoSection.annotation ? 'True' : 'False'} />
				</fieldset>
			)}
		</div>
	)
}

export default Parameters