import { useEffect, useRef } from "react";
import FormElementInputRadio from "./FormElementInputRadio";
import HelpIcon from "../../assets/help.png";

const LONG_READ_PLATFORMS = new Set(['PACBIO_SMRT', 'OXFORD_NANOPORE']);

export default function SectionRnaAssembly({ updateParameters, parameters }) {
    const platform = (
        parameters.startSection.rnaSequencingPlatform ||
        parameters.startSection.rnaSequencingRunList?.[0]?.platform ||
        ''
    ).toUpperCase();

    const isLongRead = LONG_READ_PLATFORMS.has(platform);

    const currentAssembler = parameters.rnaAssemblySection?.assembler || 'trinity';
    const previousPlatformRef = useRef(platform);

    useEffect(() => {
        if (!platform) {
            return;
        }

        const previousPlatform = (previousPlatformRef.current || '').toUpperCase();
        const wasLongRead = LONG_READ_PLATFORMS.has(previousPlatform);

        if (isLongRead && currentAssembler !== 'rnabloom') {
            updateParameters({ rnaAssemblySection: { assembler: 'rnabloom' } });
        } else if (!isLongRead) {
            const shouldDefaultToTrinity = !currentAssembler || (wasLongRead && currentAssembler === 'rnabloom');
            if (shouldDefaultToTrinity) {
                updateParameters({ rnaAssemblySection: { assembler: 'trinity' } });
            }
        }

        previousPlatformRef.current = platform;
    }, [platform, isLongRead, currentAssembler, updateParameters]);

    const handleRadioChange = (name, isChecked) => {
        if (!isChecked) {
            return;
        }
        if (name === 'Trinity') {
            updateParameters({ rnaAssemblySection: { assembler: 'trinity' } });
        } else if (name === 'RNA-Bloom') {
            updateParameters({ rnaAssemblySection: { assembler: 'rnabloom' } });
        }
    };

    return (
        <div className="parameters-section">
            <div className="form-element">
                <div className="label-tooltip-wrapper">
                    <label>Transcriptome Assembler</label>
                    <div className="tooltip-container">
                        <img src={HelpIcon} alt="help" className="helpIcon" />
                        <span className="help-span">
                            Select one transcriptome assembly tool.
                        </span>
                    </div>
                </div>
                <div>
                    <FormElementInputRadio
                        label="Trinity"
                        help={isLongRead ? "Trinity is not available for long-read sequencing data." : "De novo transcriptome assembler optimized for short-read RNA-seq data."}
                        checked={currentAssembler === 'trinity'}
                        onChange={handleRadioChange}
                        disabled={isLongRead}
                    />
                    <FormElementInputRadio
                        label="RNA-Bloom"
                        help="Reference-free transcriptome assembler compatible with both short-read and long-read RNA-seq data."
                        checked={currentAssembler === 'rnabloom'}
                        onChange={handleRadioChange}
                    />
                </div>
            </div>
        </div>
    );
}
