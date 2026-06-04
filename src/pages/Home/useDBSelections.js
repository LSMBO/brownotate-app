import { useState } from 'react';
import { useParameters } from '../../contexts/ParametersContext';
import { speciesExists } from '../../utils/DatabaseSearch';

/**
 * Hook managing selection state for assembly, proteins, and sequencing batches.
 * Handles the bidirectional exclusion logic (selecting assembly clears proteins, etc.)
 */
export function useDBSelections() {
    const [selectedSequencingBatch, setSelectedSequencingBatch] = useState(null);
    const [selectedRNASeqBatches, setSelectedRNASeqBatches]     = useState([]);
    const [selectedAssembly, setSelectedAssembly]               = useState(null);
    const [selectedProteins, setSelectedProteins]               = useState([]);

    const { updateParameters } = useParameters();

    /** Reset all selection state and clear related parameters */
    const resetSelectionsWithParams = () => {
        setSelectedSequencingBatch(null);
        setSelectedRNASeqBatches([]);
        setSelectedAssembly(null);
        setSelectedProteins([]);
        updateParameters({
            startSection: {
                assembly: null, assemblyAccession: null,
                sequencing: null, sequencingRuns: false, sequencingRunList: [],
                sequencingFiles: false, sequencingFileList: [],
            }
        });
    };

    const updateSelectedRNASeqBatch = async (batch) => {
        if (!batch) return;

        const newBatches = selectedRNASeqBatches.some(b => b.identifier === batch.identifier)
            ? selectedRNASeqBatches.filter(b => b.identifier !== batch.identifier)
            : [...selectedRNASeqBatches, batch];

        const allRuns = newBatches.flatMap(b => b.runs);
        const platform = newBatches.length > 0
            ? (newBatches[0].runs[0]?.platform || '')
            : '';

        setSelectedRNASeqBatches(newBatches);
        updateParameters({
            startSection: {
                rnaSequencing: newBatches.length > 0 ? newBatches[0] : null,
                rnaSequencingRuns: newBatches.length > 0,
                rnaSequencingRunList: allRuns,
                rnaSequencingPlatform: platform,
            }
        });

        if (newBatches.length > 0) {
            const speciesData = await speciesExists(newBatches[0].scientificName);
            if (speciesData) {
                updateParameters({
                    species: {
                        scientificName: speciesData.scientificName,
                        taxonID: speciesData.taxonId,
                        lineage: speciesData.lineage,
                        is_bacteria: speciesData.is_bacteria,
                        imageUrl: speciesData.taxo_image_url,
                    }
                });
            }
        }

        if (selectedSequencingBatch) {
            setSelectedSequencingBatch(null);
            updateParameters({ startSection: { sequencing: null, sequencingRuns: false, sequencingRunList: [] } });
        }
        if (selectedAssembly) {
            setSelectedAssembly(null);
            updateParameters({ startSection: { assembly: null, assemblyAccession: null } });
        }
        if (selectedProteins.length) {
            setSelectedProteins([]);
        }
    };

    const updateSelectedSequencingBatch = async (batch) => {
        if (!batch || batch.identifier === selectedSequencingBatch?.identifier) {
            setSelectedSequencingBatch(null);
            updateParameters({ startSection: { sequencing: null, sequencingRuns: false, sequencingRunList: [] } });
        } else {
            setSelectedSequencingBatch(batch);
            updateParameters({
                startSection: {
                    sequencing: batch,
                    sequencingRuns: true,
                    sequencingRunList: batch.runs,
                    sequencingFiles: false,
                    sequencingFileList: [],
                    assembly: null,
                    assemblyAccession: null
                }
            });

            const speciesData = await speciesExists(batch.scientificName);
            if (speciesData) {
                updateParameters({
                    species: {
                        scientificName: speciesData.scientificName,
                        taxonID: speciesData.taxonId,
                        lineage: speciesData.lineage,
                        is_bacteria: speciesData.is_bacteria,
                        imageUrl: speciesData.taxo_image_url,
                    }
                });
            }
        }
        if (selectedAssembly)       setSelectedAssembly(null);
        if (selectedProteins.length) setSelectedProteins([]);
    };

    const updateSelectedAssembly = (assembly) => {
        if (!assembly || assembly.accession === selectedAssembly?.accession) {
            setSelectedAssembly(null);
            updateParameters({ startSection: { assembly: null, assemblyAccession: null } });
        } else {
            setSelectedAssembly(assembly);
            updateParameters({
                startSection: {
                    assembly: assembly,
                    assemblyAccession: assembly.accession,
                    sequencing: null,
                    sequencingRuns: false,
                    sequencingRunList: [],
                    sequencingFiles: false,
                    sequencingFileList: [],
                }
            });
        }
        if (selectedSequencingBatch) setSelectedSequencingBatch(null);
        if (selectedProteins.length)  setSelectedProteins([]);
    };

    const getProteinSelectionKey = (protein) => {
        if (!protein) return '';
        return [
            protein.database || '',
            protein.accession || '',
            protein.taxid || '',
            protein.download_url || '',
            Array.isArray(protein.download_command) ? protein.download_command.join(' ') : ''
        ].join('|');
    };

    const updateSelectedProteins = (protein) => {
        const proteinKey = getProteinSelectionKey(protein);
        setSelectedProteins(prev =>
            prev.some(p => getProteinSelectionKey(p) === proteinKey)
                ? prev.filter(p => getProteinSelectionKey(p) !== proteinKey)
                : [...prev, protein]
        );
        if (protein && selectedSequencingBatch) {
            setSelectedSequencingBatch(null);
            updateParameters({ startSection: { sequencing: null, sequencingRuns: false, sequencingRunList: [] } });
        }
        if (protein && selectedAssembly) {
            setSelectedAssembly(null);
            updateParameters({ startSection: { assembly: null, assemblyAccession: null } });
        }
    };

    return {
        selectedSequencingBatch,
        setSelectedSequencingBatch,
        selectedRNASeqBatches,
        selectedAssembly,
        selectedProteins,
        resetSelectionsWithParams,
        updateSelectedSequencingBatch,
        updateSelectedRNASeqBatch,
        setSelectedRNASeqBatches,
        updateSelectedAssembly,
        updateSelectedProteins,
    };
}
