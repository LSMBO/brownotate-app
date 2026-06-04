import ParameterItem from './ParameterItem';

function Parameters({ annotation, functionalAnnotationRun=false }) {
	const startSection = annotation.parameters?.startSection || {};
	const isRnaSequencing = Boolean(startSection.rnaSequencing);
	const isDnaSequencing = Boolean(startSection.sequencing);
	const isAssemblyStart = Boolean(startSection.assembly);

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

	const getBrownotateVersion = () => {
		return annotation.resumeData?.brownotate_version || 'N/A';
	};

	const getSpeciesDisplay = () => {
		const species = annotation.parameters?.species || {};
		if (!species.scientificName && !species.taxonID) {
			return 'N/A';
		}
		return `${species.scientificName || 'Unknown'} (TaxID: ${species.taxonID || 'N/A'})`;
	};

	const getEvidenceInfo = () => {
		const section = annotation.parameters?.annotationSection || {};
		const mode = section.evidenceSelectionMode || (section.autoEvidence ? 'automatic' : 'custom');
		const entries = section.selectedEvidenceEntries || [];

		return (
			<div>
				<div className="value"><b>Mode:</b> {mode}</div>
				{mode === 'automatic' && entries.length > 0 && (
					<div style={{ marginTop: '6px' }}>
						<div className="value"><b>Selected evidence entries:</b></div>
						{entries.map((entry, idx) => (
							<div className="value" key={`entry-${idx}`}>
								- {entry.scientific_name || 'Unknown'} ({entry.taxid || 'NA'}) [{entry.database || 'Unknown'}] {entry.accession ? `- ${entry.accession}` : ''}
							</div>
						))}
					</div>
				)}
				{mode === 'custom' && section.evidenceOriginalFilename && (
					<div style={{ marginTop: '6px' }}>
						<div className="value"><b>File:</b> {section.evidenceOriginalFilename}</div>
					</div>
				)}
			</div>
		);
	};

	const formatRunDisplay = (run) => {
		if (!run) return 'N/A';
		const accession = run.accession || 'unknown';
		const platform = run.platform || 'unknown';
		const size = Number(run.size);
		const sizeSuffix = Number.isFinite(size) ? ` ${size.toFixed(2)} Gb FASTQ` : '';
		return `${accession} (${platform})${sizeSuffix}`;
	};

	const getStartedMode = () => {
		if (isAssemblyStart) return 'Assembly';
		if (isRnaSequencing) return 'RNA Sequencing';
		if (isDnaSequencing) return 'DNA Sequencing';
		return 'N/A';
	};

	const getAssemblerDisplay = () => {
		if (isRnaSequencing) {
			const assembler = String(annotation.parameters?.rnaAssemblySection?.assembler || '').toLowerCase();
			if (assembler === 'rnabloom') return 'RNA-Bloom';
			if (assembler === 'trinity') return 'Trinity';
			return 'N/A';
		}

		if (isDnaSequencing) {
			if (annotation.parameters?.assemblySection?.canu) return 'CANU';
			if (annotation.parameters?.assemblySection?.megahit) return 'Megahit';
		}

		return 'N/A';
	};

	return (
		<div className="run-parameters">
			<fieldset>
				<legend className="t2_bold">Run metadata</legend>
				<ParameterItem label='Brownotate version' value={getBrownotateVersion()} />
				<ParameterItem label='Run ID' value={annotation.parameters?.id || 'N/A'} />
				<ParameterItem label='Annotated species' value={getSpeciesDisplay()} />
			</fieldset>
			
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
					<ParameterItem label='Mode' value={getStartedMode()} />
					{isDnaSequencing && <ParameterItem label='Assembler' value={getAssemblerDisplay()} />}
					{isRnaSequencing && <ParameterItem label='Transcriptome assembler' value={getAssemblerDisplay()} />}
					{annotation.parameters.startSection.sequencingFiles && !isRnaSequencing &&
						<ParameterItem label='Sequencing file(s)' value={listDisplay(annotation.parameters.startSection.sequencingFileListOnServer)} />
					}
					{annotation.parameters.startSection.sequencingRuns && !isRnaSequencing &&
						<ParameterItem label='Sequencing accession(s)' value={listDisplay((annotation.parameters.startSection.sequencingRunList || []).map(formatRunDisplay))} />
					}
					{annotation.parameters.startSection.rnaSequencingFiles &&
						<ParameterItem label='RNA sequencing file(s)' value={listDisplay(annotation.parameters.startSection.rnaSequencingFileListOnServer)} />
					}
					{annotation.parameters.startSection.rnaSequencingRuns &&
						<ParameterItem label='RNA sequencing accession(s)' value={listDisplay((annotation.parameters.startSection.rnaSequencingRunList || []).map(formatRunDisplay))} />
					}
					{annotation.parameters.startSection.sequencing && annotation.parameters.startSection.sequencing.depth !== undefined && !isRnaSequencing &&
						<ParameterItem label='Sequencing coverage' value={`${annotation.parameters.startSection.sequencing.depth.toFixed(1)}×`} />
					}
					{annotation.parameters.startSection.assemblyFile &&
						<ParameterItem label="Assembly file" value={annotation.parameters.startSection.assemblyFileOnServer} />
					}
					{annotation.parameters.startSection.assemblyAccession &&
						<ParameterItem label="Assembly accession" value={annotation.parameters.startSection.assemblyAccession} />
					}
					{annotation.parameters.startSection.sequencing && annotation.parameters.assemblySection?.megahit && !isRnaSequencing && (
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
					{!annotation.parameters.species.is_bacteria && !isRnaSequencing && (
						<>
							<ParameterItem label="Automatic evidence selection" value={annotation.parameters.annotationSection.autoEvidence ? 'True' : 'False'} />
							<ParameterItem label="Evidence details" value={getEvidenceInfo()} />
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
					{!isRnaSequencing && (
						<ParameterItem label="Evaluate the assembly completeness" value={annotation.parameters.buscoSection.assembly ? 'True' : 'False'} />
					)}
					<ParameterItem label="Evaluate the annotation completeness" value={annotation.parameters.buscoSection.annotation ? 'True' : 'False'} />
				</fieldset>
			)}
		</div>
	)
}

export default Parameters