import React from 'react';
import ParameterItem from './ParameterItem';

function Parameters({ annotation }) {

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
        if (annotation.parameters.startSection.removeStrict) {
            return '100% Identity - Same length';
        } else if (annotation.parameters.startSection.removeSoft) {
            return '100% Identity - lower length';
        } else {
            return 'All sequences are conserved';
        }
    };

	const getExcludedSpeciesList = () => {
		const { excludedSpeciesList } = annotation.parameters.brownamingSection;
		if (excludedSpeciesList) {
			return (
				<div>
					{excludedSpeciesList.map((item) => (
						<div className="value" key={item.taxID}>
							{item.scientific_name} ({item.taxID})
						</div>
					))}
				</div>
			);
		} else {
			return 'None'
		}
	}

	return (
		<div className="run-parameters">
			<h3>Selected parameters</h3>
			<fieldset>
				<legend className="t2_bold">Started data</legend>
				<ParameterItem label='Mode' value={annotation.parameters.startSection.assembly ? 'Assembly' : 'Sequencing'} />
				{annotation.parameters.startSection.sequencingFiles &&
					<ParameterItem label='Sequencing file(s)' value={listDisplay(annotation.parameters.startSection.sequencingFileListOnServer)} />
				}
				{annotation.parameters.startSection.sequencingRuns &&
					<ParameterItem label='Sequencing accession(s)' value={listDisplay(annotation.parameters.startSection.sequencingRunList.map(run => run.accession))} />
				}
				{annotation.parameters.startSection.assemblyFile &&
					<ParameterItem label="Assembly file" value={annotation.parameters.startSection.assemblyFileOnServer} />
				}
				{annotation.parameters.startSection.assemblyAccession &&
					<ParameterItem label="Assembly accession" value={annotation.parameters.startSection.assemblyAccession} />
				}				
				{annotation.parameters.startSection.sequencing &&
					<ParameterItem label="Skip fastp" value={annotation.parameters.startSection.skipFastp ? 'True' : 'False'} />
				}
				{annotation.parameters.startSection.sequencing &&
					<ParameterItem label="Skip phix removing" value={annotation.parameters.startSection.skipPhix ? 'True' : 'False'} />
				}
			</fieldset>
						{/* <div className="debugging-container">
				<h3>Debugging Information</h3>
				<pre>{JSON.stringify(annotation.parameters.annotationSection, null, 2)}</pre>
			</div> */}
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
			<fieldset>
				<legend className="t2_bold">Brownaming parameters</legend>
				<ParameterItem label="Skip Brownaming" value={annotation.parameters.brownamingSection.skip ? 'True' : 'False'} />
				{!annotation.parameters.brownamingSection.skip &&
					<ParameterItem label="Excluded species" value={getExcludedSpeciesList()} />
				}
				{!annotation.parameters.brownamingSection.skip &&
					<ParameterItem label="Highest taxa rank" value={annotation.parameters.brownamingSection.highestRank} />
				}
			</fieldset>
			<fieldset>
				<legend className="t2_bold">Busco parameters</legend>
				<ParameterItem label="Evaluate the assembly completeness" value={annotation.parameters.buscoSection.assembly ? 'True' : 'False'} />
				<ParameterItem label="Evaluate the annotation completeness" value={annotation.parameters.buscoSection.annotation ? 'True' : 'False'} />
			</fieldset>
		</div>
	)
}

export default Parameters