import React from 'react';
import ParameterItem from './ParameterItem';

function Parameters({ run }) {

	const listDisplay = (list) => {
        return (
            <div>
                {list.map((item, index) => (
                    <div className="value" key={index}>- {item}</div>
                ))}
            </div>
        );
    };

	const getDuplicationMethod = () => {
        if (run.parameters.startSection.removeStrict) {
            return '100% Identity - Same length';
        } else if (run.parameters.startSection.removeSoft) {
            return '100% Identity - lower length';
        } else {
            return 'All sequences are conserved';
        }
    };

	const getExcludedSpeciesList = () => {
		const { excludedSpeciesList } = run.parameters.brownamingSection;
		if (excludedSpeciesList.length > 0) {
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
				<ParameterItem label='Mode' value={run.parameters.startSection.assembly ? 'Assembly' : 'Sequencing'} />
				{run.parameters.startSection.sequencingFiles &&
					<ParameterItem label='Sequencing file(s)' value={listDisplay(run.parameters.startSection.sequencingFileList)} />
				}
				{run.parameters.startSection.sequencingAccessions &&
					<ParameterItem label='Sequencing accession(s)' value={listDisplay(run.parameters.startSection.sequencingAccessionList)} />
				}
				{run.parameters.startSection.assemblyFile &&
					<ParameterItem label="Assembly file" value={run.parameters.startSection.assemblyFileList} />
				}
				{run.parameters.startSection.sequencing &&
					<ParameterItem label="Skip fastp" value={run.parameters.startSection.skipFastp ? 'True' : 'False'} />
				}
				{run.parameters.startSection.sequencing &&
					<ParameterItem label="Skip phix removing" value={run.parameters.startSection.skipPhix ? 'True' : 'False'} />
				}
			</fieldset>
			<fieldset>
				<legend className="t2_bold">Annotation parameters</legend>
				<ParameterItem label="Automatic evidence selection" value={run.parameters.annotationSection.evidenceAuto ? 'True' : 'False'} />
				{!run.parameters.annotationSection.evidenceAuto &&
					<ParameterItem label="Evidence file" value={run.parameters.annotationSection.evidenceFileList[0]} />
				}
				<ParameterItem label="Removed duplicated sequences" value={getDuplicationMethod()} />
				<ParameterItem label="Minimal sequence length" value={run.parameters.annotationSection.minLength} />
			</fieldset>
			<fieldset>
				<legend className="t2_bold">Brownaming parameters</legend>
				<ParameterItem label="Skip Brownaming" value={run.parameters.brownamingSection.skip ? 'True' : 'False'} />
				{!run.parameters.brownamingSection.skip &&
					<ParameterItem label="Excluded species" value={getExcludedSpeciesList()} />
				}
				{!run.parameters.brownamingSection.skip &&
					<ParameterItem label="Highest taxa rank" value={run.parameters.brownamingSection.highestRank} />
				}
			</fieldset>
			<fieldset>
				<legend className="t2_bold">Busco parameters</legend>
				<ParameterItem label="Evaluate the assembly completeness" value={run.parameters.buscoSection.assembly ? 'True' : 'False'} />
				<ParameterItem label="Evaluate the annotation completeness" value={run.parameters.buscoSection.annotation ? 'True' : 'False'} />
			</fieldset>
		</div>
	)
}

export default Parameters