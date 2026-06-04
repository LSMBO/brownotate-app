import { useState } from "react";
import { useParameters } from "../../contexts/ParametersContext";
import { searchSequencingRun } from '../../utils/DatabaseSearch';

export default function RnaSequencingRuns({ disabled }) {
    const { parameters, updateParameters } = useParameters();
    const [accession, setAccession] = useState("");
    const [searchError, setSearchError] = useState(null);

    const searchSequencing = async () => {
        const alreadyExists = parameters.startSection.rnaSequencingRunList.some(
            run => run.accession === accession.trim()
        );

        if (alreadyExists) {
            setSearchError(`${accession} is already in the list`);
            return;
        }

        const data = await searchSequencingRun(accession);
        if (data.success) {
            setSearchError(null);
            const updatedRunList = [...parameters.startSection.rnaSequencingRunList, data.data];
            const platform = updatedRunList[0]?.platform || '';
            updateParameters({startSection: {
                rnaSequencingRunList: updatedRunList,
                rnaSequencingPlatform: platform,
            }});
        } else {
            setSearchError(`${accession} not found in NCBI SRA`);
        }
    };

    return (
        <>
            <div className="settings-sequencing-runs">
                <input
                    type="text"
                    placeholder="RNA-seq run accession"
                    value={accession}
                    onChange={(e) => setAccession(e.target.value)}
                    disabled={disabled}
                />
                <button onClick={searchSequencing} disabled={disabled}>Add</button>
            </div>
            {searchError && <div className="error-message">{searchError}</div>}
        </>
    );
}
