import { useState } from "react";
import { useParameters } from "../../contexts/ParametersContext";
import { searchSequencingRun } from '../../utils/DatabaseSearch';



export default function SequencingRuns({ disabled }) {
    const { parameters, updateParameters } = useParameters();
    const [accession, setAccession] = useState("");
    const [searchError, setSearchError] = useState(null);

    const searchSequencing = async () => {
        const data = await searchSequencingRun(accession);
        if (data.success) {
            setSearchError(null);
            const updatedRunList = [...parameters.startSection.sequencingRunList, data.data];
            updateParameters({startSection: {sequencingRunList: updatedRunList}});
        } else {
            setSearchError(`${accession} not found in NCBI SRA`);
        }
    };

    return (
        <>
            <div className="settings-sequencing-runs">
                <input
                    type="text"
                    placeholder="Sequencing run accession"
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