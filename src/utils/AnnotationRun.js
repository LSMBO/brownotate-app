
import axios from 'axios';
import CONFIG from '../config';
import { runAsyncPolledStep } from './pipelinePolling';


async function executeRequest(promise, user, runId, updateAnnotation, completed_annotation=false) {
    // Only update status to 'completed' when annotation is done
    // Status is already 'running' from create_run, no need to set it again
    if (completed_annotation) {
        try {
            await updateAnnotation(user, runId, 'status', 'completed');
        } catch (error) {
            console.error('Error updating status to completed:', error);
        }
    }
    
    let response;
    try {
        response = await promise;
        console.log('Response from server:', response);
    } catch (error) {
        console.error('Request failed with error:', error.message);
        console.error('Error code:', error.code);
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout - the operation took too long');
        }
        if (error.response) {
            console.error('Server responded with error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('No response received from server - possible timeout or network issue');
            console.error('This might be a timeout after a long-running operation');
        }
        await updateAnnotation(user, runId, 'status', 'failed');
        await updateAnnotation(user, runId, 'error', error.response?.data || error.message);
        return { data: null, error: true };
    }   
    
    if (response.status !== 200) {
        await updateAnnotation(user, runId, 'status', 'failed');
        await updateAnnotation(user, runId, 'error', response.data?.message || 'Request failed');
        return { data: null, error: true, message: response.data?.message };
    } 
    return { data: response.data, error: null };
}

async function runLongRouteStep({
    startPath,
    statusPath,
    payload,
    statusQuery,
    stepLabel,
    user,
    runId,
    updateAnnotation
}) {
    try {
        return await runAsyncPolledStep({
            apiBaseUrl: CONFIG.API_BASE_URL,
            startPath,
            statusPath,
            payload,
            statusQuery,
            stepLabel,
            user,
            runId,
            updateAnnotation,
            pollMs: 30000
        });
    } catch (error) {
        console.error(`${stepLabel} failed:`, error);
        return null;
    }
}

function organizeSequencingFiles(sequencingFileList) {
    const pairedFiles = {};
    const result = [];
    if (typeof sequencingFileList === 'string') {
        sequencingFileList = [sequencingFileList];
    }
    sequencingFileList.forEach(filePath => {
        filePath = filePath.substring(1, filePath.length - 1); // CLear surrounding quotes
        const fileName = filePath.split('/').pop();

        const baseName = fileName
            .replace('.fastq.gz', '')
            .replace('.fastq', '')
            .replace('.fq.gz', '')
            .replace('.fq', '');

        if (baseName.endsWith('1')) {
            const accession = baseName.slice(0, -1);
            if (!pairedFiles[accession]) {
                pairedFiles[accession] = { accession, file_name: [], platform: null };
            }
            pairedFiles[accession].file_name.push(`"${filePath}"`);
        } else if (baseName.endsWith('2')) {
            const accession = baseName.slice(0, -1);
            if (!pairedFiles[accession]) {
                pairedFiles[accession] = { accession, file_name: [], platform: null };
            }
            pairedFiles[accession].file_name.push(`"${filePath}"`);
        } else {
            // If it's a single file, add it directly
            result.push({ accession: baseName, file_name: `"${filePath}"`, platform: null });
        }
    });

    // Add paired files to the result
    Object.values(pairedFiles).forEach(entry => {
        if (entry.file_name.length > 1) {
            result.push(entry);
        } else {
            // If only one file exists, treat it as a single file
            result.push({ accession: entry.accession, file_name: entry.file_name, platform: null });
        }
    });
    return result;
}

export async function handleAnnotationRun(runId, user, updateAnnotation, resume=false) {
    const getRunResult = await executeRequest(
        axios.post(`${CONFIG.API_BASE_URL}/get_run`, { 'run_id': runId }),
        user, runId, updateAnnotation
    );
    if (getRunResult.error) {
      console.error('Error fetching run data:', getRunResult.error);
      return;
    }
    let runData = getRunResult.data.data;
    let parameters = runData.parameters;
    let assemblyFile;
    let annotationFile;
    console.log('handleAnnotationRun() runData:', runData);

    if (parameters.startSection.sequencing) {
        let sequencingFileList;
        if (resume && runData.resumeData && runData.resumeData.sequencingFileList) {
            sequencingFileList = runData.resumeData.sequencingFileList;
        } else if (parameters.startSection.sequencingFiles) {
            sequencingFileList = organizeSequencingFiles(parameters.startSection.sequencingFileListOnServer);
        } else {
            await updateAnnotation(user, runId, 'progress', 'Downloading sequencing files from SRA ...');
            const downloadResult = await executeRequest(
                axios.post(`${CONFIG.API_BASE_URL}/download_sra`, { 'parameters': parameters }),
                user, runId, updateAnnotation
            );
            if (downloadResult.error) {
              console.error('Error downloading sequencing files:', downloadResult.error);
              return;
            }
            sequencingFileList = downloadResult.data.data;
            console.log('Download SRA completed in', downloadResult.data.timer);
            await updateAnnotation(user, runId, 'timers', {'Downloading sequencing files from SRA ...': downloadResult.data.timer})
        }
        console.log('Sequencing files:', sequencingFileList);
        await updateAnnotation(user, runId, 'resumeData', {'sequencingFileList': sequencingFileList});
        
        let sequencingFileListProcessed;
        
        // Preprocessing: run fastp if requested (skip if using CANU - it has its own correction/trimming)
        let sequencingFileListAfterFastp;
        if (parameters.assemblySection.runFastp && !parameters.assemblySection.canu) {
            if (resume && runData.resumeData && runData.resumeData.sequencingFileListAfterFastp) {
                sequencingFileListAfterFastp = runData.resumeData.sequencingFileListAfterFastp;
            } else {
                await updateAnnotation(user, runId, 'progress', 'Running fastp on sequencing files ...');
                const fastpResult = await runLongRouteStep({
                    startPath: '/run_fastp_async',
                    statusPath: `/check_fastp_status/${runId}`,
                    payload: { 'parameters': parameters, 'sequencing_file_list': sequencingFileList },
                    stepLabel: 'Running fastp on sequencing files ...',
                    user,
                    runId,
                    updateAnnotation
                });
                if (!fastpResult) {
                    console.error('Error running fastp');
                    return;
                }
                console.log('fastpResult:', fastpResult);
                console.log('Fastp completed in', fastpResult.timer);
                await updateAnnotation(user, runId, 'timers', {'Running fastp on sequencing files ...': fastpResult.timer})
                sequencingFileListAfterFastp = fastpResult.data;
            }
        } else {
            sequencingFileListAfterFastp = sequencingFileList;
        }
        console.log('Sequencing files after fastp:', sequencingFileListAfterFastp);
        await updateAnnotation(user, runId, 'resumeData', {'sequencingFileListAfterFastp': sequencingFileListAfterFastp});

        // Preprocessing: run bowtie2 (PhiX removal) if requested (skip if using CANU)
        let sequencingFileListAfterRemovePhix;
        if (parameters.assemblySection.runBowtie2 && !parameters.assemblySection.canu) {
            if (resume && runData.resumeData && runData.resumeData.sequencingFileListAfterRemovePhix) {
                sequencingFileListAfterRemovePhix = runData.resumeData.sequencingFileListAfterRemovePhix;
            } else {
                await updateAnnotation(user, runId, 'progress', 'Removing Phix from sequencing files ...');
                const removePhixResult = await runLongRouteStep({
                    startPath: '/run_remove_phix_async',
                    statusPath: `/check_remove_phix_status/${runId}`,
                    payload: { 'parameters': parameters, 'sequencing_file_list': sequencingFileListAfterFastp },
                    stepLabel: 'Removing Phix from sequencing files ...',
                    user,
                    runId,
                    updateAnnotation
                });
                if (!removePhixResult) {
                    console.error('Error removing Phix');
                    return;
                }
                console.log('removePhixResult:', removePhixResult);
                console.log('Remove Phix completed in', removePhixResult.timer);
                await updateAnnotation(user, runId, 'timers', {'Removing Phix from sequencing files ...': removePhixResult.timer})
                sequencingFileListAfterRemovePhix = removePhixResult.data;
            }
        } else {
            sequencingFileListAfterRemovePhix = sequencingFileListAfterFastp;
        }
        console.log('Sequencing files after remove phix:', sequencingFileListAfterRemovePhix);
        await updateAnnotation(user, runId, 'resumeData', {'sequencingFileListAfterRemovePhix': sequencingFileListAfterRemovePhix});
        
        // For CANU, always use raw files; for Megahit, use processed files
        sequencingFileListProcessed = parameters.assemblySection.canu ? sequencingFileList : sequencingFileListAfterRemovePhix;


        if (resume && runData.resumeData && runData.resumeData.assemblyFile) {
            assemblyFile = runData.resumeData.assemblyFile;
        } else {
            // Run assembler based on selected assembler in parameters
            if (parameters.assemblySection.canu) {
                // Check if CANU already completed (resume scenario)
                if (resume && runData.resumeData && runData.resumeData.canu_status === 'completed') {
                    console.log('[CANU] CANU already completed, using existing assembly file');
                    assemblyFile = runData.resumeData.assemblyFile;
                    console.log('[CANU] Assembly file:', assemblyFile);
                } else {
                    await updateAnnotation(user, runId, 'progress', 'Running CANU assembly ...');
                    const canuResult = await runLongRouteStep({
                        startPath: '/run_canu',
                        statusPath: `/check_canu_status/${runId}`,
                        payload: {
                            'parameters': parameters,
                            'sequencing_file_list': sequencingFileListProcessed
                        },
                        stepLabel: 'Running CANU assembly ...',
                        user,
                        runId,
                        updateAnnotation
                    });

                    if (!canuResult) {
                        console.error('[CANU] Failed');
                        return;
                    }
                    assemblyFile = canuResult.data;
                    console.log('[CANU] Continuing workflow with assembly:', assemblyFile);
                }
                
            } else {
                await updateAnnotation(user, runId, 'progress', 'Running Megahit assembly ...');
                const megahitResult = await runLongRouteStep({
                    startPath: '/run_megahit_async',
                    statusPath: `/check_megahit_status/${runId}`,
                    payload: { 'parameters': parameters, 'sequencing_file_list': sequencingFileListProcessed },
                    stepLabel: 'Running Megahit assembly ...',
                    user,
                    runId,
                    updateAnnotation
                });
                if (!megahitResult) {
                    console.error('Error running Megahit');
                    return;
                } 
                console.log('Megahit completed in', megahitResult.timer);
                await updateAnnotation(user, runId, 'timers', {'Running Megahit assembly ...': megahitResult.timer})
                assemblyFile = megahitResult.data;
                await updateAnnotation(user, runId, 'resumeData', {'assemblyFile': assemblyFile});
            }
        }    
    } else {
        assemblyFile = parameters.startSection.assemblyFileOnServer;
    }

    console.log('Assembly file:', assemblyFile);

    if (parameters.buscoSection.assembly && !(resume && runData.resumeData && runData.resumeData.buscoAssembly)) {
        await updateAnnotation(user, runId, 'progress', 'Running BUSCO on assembly ...');
        const buscoAssemblyResult = await runLongRouteStep({
            startPath: '/run_busco_async',
            statusPath: `/check_busco_status/${runId}`,
            statusQuery: { mode: 'genome' },
            payload: { 'parameters': parameters, 'input_file': assemblyFile, 'mode': 'genome' },
            stepLabel: 'Running BUSCO on assembly ...',
            user,
            runId,
            updateAnnotation
        });
        if (!buscoAssemblyResult) {
            console.error('Error running BUSCO on assembly');
            return;
        }
        console.log('BUSCO on assembly completed in', buscoAssemblyResult.timer);
        await updateAnnotation(user, runId, 'timers', {'Running BUSCO on assembly ...': buscoAssemblyResult.timer})
        let buscoAssemblyResultData = buscoAssemblyResult.data;
        console.log('BUSCO assembly result:', buscoAssemblyResultData);
        await updateAnnotation(user, runId, 'resumeData', {'buscoAssembly': true});
    }

    if (parameters.species.is_bacteria) {
        if (resume && runData.resumeData && runData.resumeData.annotationFile) {
            annotationFile = runData.resumeData.annotationFile;
        } else {
            await updateAnnotation(user, runId, 'progress', 'Running Prokka annotation ...');
            const prokkaResult = await runLongRouteStep({
                startPath: '/run_prokka_async',
                statusPath: `/check_prokka_status/${runId}`,
                payload: { 'parameters': parameters, 'assembly_file': assemblyFile },
                stepLabel: 'Running Prokka annotation ...',
                user,
                runId,
                updateAnnotation
            });
            if (!prokkaResult) {
                console.error('Error running Prokka');
                return;
            }
            console.log('Prokka completed in', prokkaResult.timer);
            await updateAnnotation(user, runId, 'timers', {'Running Prokka annotation ...': prokkaResult.timer})
            annotationFile = prokkaResult.data;
            console.log('Prokka annotation file:', annotationFile);
            await updateAnnotation(user, runId, 'resumeData', {'annotationFile': annotationFile});
        }
    } 
    
    
    else {
        let evidenceFile = parameters.annotationSection.evidenceFileOnServer;
        let splitAssemblyFiles;
        if (resume && runData.resumeData && runData.resumeData.splitAssemblyFiles) {
            splitAssemblyFiles = runData.resumeData.splitAssemblyFiles;
        } else {
            await updateAnnotation(user, runId, 'progress', 'Splitting assembly for annotation ...');
            const splitAssemblyResult = await executeRequest(
                axios.post(`${CONFIG.API_BASE_URL}/run_split_assembly`, { 'parameters': parameters, 'assembly_file': assemblyFile }),
                user, runId, updateAnnotation
            );
            if (splitAssemblyResult.error) {
                console.error('Error splitting assembly:', splitAssemblyResult.error);
                return;
            }
            console.log('Split assembly completed in', splitAssemblyResult.data.timer);
            await updateAnnotation(user, runId, 'timers', {'Splitting assembly for annotation ...': splitAssemblyResult.data.timer})
            splitAssemblyFiles = splitAssemblyResult.data.data;
            console.log('Split assembly files:', splitAssemblyFiles);
            await updateAnnotation(user, runId, 'resumeData', {'splitAssemblyFiles': splitAssemblyFiles});
        }

        let genesRaw;
        let numGenes;
        if (resume && runData.resumeData && runData.resumeData.genesRaw) {
            genesRaw = runData.resumeData.genesRaw;
        } else {
            await updateAnnotation(user, runId, 'progress', 'Running Scipio ...');
            const scipioResult = await runLongRouteStep({
                startPath: '/run_scipio_async',
                statusPath: `/check_scipio_status/${runId}`,
                statusQuery: { flex: 'false' },
                payload: { 'parameters': parameters, 'split_assembly_files': splitAssemblyFiles, 'evidence_file': evidenceFile, 'flex': false },
                stepLabel: 'Running Scipio ...',
                user,
                runId,
                updateAnnotation
            });
            if (!scipioResult) {
                console.error('Error running Scipio');
                return;
            }
            console.log('Scipio completed in', scipioResult.timer);
            await updateAnnotation(user, runId, 'timers', {'Running Scipio ...': scipioResult.timer})
            genesRaw = scipioResult.data;
            console.log('genesRaw:', genesRaw);
            await updateAnnotation(user, runId, 'resumeData', {'genesRaw': genesRaw, 'scipioFlex':false});
        }

        if (resume && runData.resumeData && runData.resumeData.numGenes) {
            numGenes = runData.resumeData.numGenes;
        } else {
            await updateAnnotation(user, runId, 'progress', 'Running gene prediction model ...');
            const modelResult = await runLongRouteStep({
                startPath: '/run_model_async',
                statusPath: `/check_model_status/${runId}`,
                payload: { 'parameters': parameters, 'genesraw': genesRaw },
                stepLabel: 'Running gene prediction model ...',
                user,
                runId,
                updateAnnotation
            });
            if (!modelResult) {
                console.error('Error running gene prediction model');
                return;
            }
            console.log('Gene prediction model completed in', modelResult.timer);
            await updateAnnotation(user, runId, 'timers', {'Running gene prediction model ...': modelResult.timer})
            numGenes = modelResult.data;
            console.log('Number of genes predicted:', numGenes);
            await updateAnnotation(user, runId, 'resumeData', {'numGenes': numGenes, 'scipioFlex':false});
        }

        if (numGenes < 200 && !(resume && runData.resumeData && runData.resumeData.scipioFlex) ) {
            await updateAnnotation(user, runId, 'progress', `Less than 200 genes predicted (${numGenes}), retrying with more flexible Scipio ...`);
            const scipioFlexResult = await runLongRouteStep({
                startPath: '/run_scipio_async',
                statusPath: `/check_scipio_status/${runId}`,
                statusQuery: { flex: 'true' },
                payload: { 'parameters': parameters, 'split_assembly_files': splitAssemblyFiles, 'evidence_file': evidenceFile, 'flex': true },
                stepLabel: 'Running flexible Scipio ...',
                user,
                runId,
                updateAnnotation
            });
            if (!scipioFlexResult) {
                console.error('Error running flexible Scipio');
                return;
            }
            console.log('Flexible Scipio completed in', scipioFlexResult.timer);
            await updateAnnotation(user, runId, 'timers', {'Running flexible Scipio ...': scipioFlexResult.timer})
            genesRaw = scipioFlexResult.data;
            console.log('genesRaw:', genesRaw);
            await updateAnnotation(user, runId, 'resumeData', {'genesRaw': genesRaw, 'scipioFlex':true});
        }

        if (numGenes < 200) {
            await updateAnnotation(user, runId, 'progress', 'Running gene prediction model after flexible Scipio ...');
            const modelFlexResult = await runLongRouteStep({
                startPath: '/run_model_async',
                statusPath: `/check_model_status/${runId}`,
                payload: { 'parameters': parameters, 'genesraw': genesRaw },
                stepLabel: 'Running gene prediction model after flexible Scipio ...',
                user,
                runId,
                updateAnnotation
            });
            if (!modelFlexResult) {
                console.error('Error running gene prediction model again');
                return;
            }
            console.log('Gene prediction model after flexible Scipio completed in', modelFlexResult.timer);
            await updateAnnotation(user, runId, 'timers', {'Running gene prediction model after flexible Scipio ...': modelFlexResult.timer})
            numGenes = modelFlexResult.data;
            console.log('Number of genes predicted after flexible Scipio:', numGenes);


            if (numGenes < 200) {
                console.log('Less than 200 genes predicted, stopping annotation run.');
                await updateAnnotation(user, runId, 'progress', 'Annotation run stopped due to insufficient gene predictions (<200).');
                return;
            }
        }

        if (!(resume && runData.resumeData && runData.resumeData.modelOptimized)) {
            await updateAnnotation(user, runId, 'progress', 'Optimizing gene prediction model ...');
            const optimizeModelResult = await runLongRouteStep({
                startPath: '/run_optimize_model_async',
                statusPath: `/check_optimize_model_status/${runId}`,
                payload: { 'parameters': parameters, 'num_genes': numGenes },
                stepLabel: 'Optimizing gene prediction model ...',
                user,
                runId,
                updateAnnotation
            });
            if (!optimizeModelResult) {
                console.error('Error optimizing gene prediction model');
                return;
            }
            console.log('Gene prediction model optimization completed in', optimizeModelResult.timer);
            await updateAnnotation(user, runId, 'timers', {'Optimizing gene prediction model ...': optimizeModelResult.timer})
            await updateAnnotation(user, runId, 'resumeData', {'modelOptimized': true});
        }
        
        if (resume && runData.resumeData && runData.resumeData.annotationFile) {
            annotationFile = runData.resumeData.annotationFile;
        } else {    
            await updateAnnotation(user, runId, 'progress', 'Running Augustus annotation ...');
            const augustusResult = await runLongRouteStep({
                startPath: '/run_augustus_async',
                statusPath: `/check_augustus_status/${runId}`,
                payload: { 'parameters': parameters, 'split_assembly_files': splitAssemblyFiles },
                stepLabel: 'Running Augustus annotation ...',
                user,
                runId,
                updateAnnotation
            });
            if (!augustusResult) {
                console.error('Error running Augustus');
                return;
            }
            console.log('Augustus annotation completed in', augustusResult.timer);
            await updateAnnotation(user, runId, 'timers', {'Running Augustus annotation ...': augustusResult.timer})
            annotationFile = augustusResult.data;
            console.log('Augustus annotation file:', annotationFile);
            await updateAnnotation(user, runId, 'resumeData', {'annotationFile': annotationFile});
        }
    }

    
    if (parseInt(parameters.annotationSection.minLength) > 0) {
        if (resume && runData.resumeData && runData.resumeData.minLength) {
            annotationFile = runData.resumeData.annotationFile;
        } else {
            await updateAnnotation(user, runId, 'progress', 'Removing short sequences from annotation according to the length filter ...');
            const removeShortSequencesResult = await executeRequest(
                axios.post(`${CONFIG.API_BASE_URL}/run_remove_short_sequences`, { 'parameters': parameters, 'annotation_file': annotationFile }),
                user, runId, updateAnnotation
            );
            if (removeShortSequencesResult.error) {
                console.error('Error removing short sequences:', removeShortSequencesResult.error);
                return;
            }
            console.log('Remove short sequences completed in', removeShortSequencesResult.data.timer);
            await updateAnnotation(user, runId, 'timers', {'Removing short sequences from annotation ...': removeShortSequencesResult.data.timer})
            console.log(removeShortSequencesResult.data.data.sequence_removed, 'sequences removed');
            annotationFile = removeShortSequencesResult.data.data.annotation_file;
            console.log('Annotation file after removing short sequences:', annotationFile);
            await updateAnnotation(user, runId, 'resumeData', {'annotationFile': annotationFile, 'minLength': true});
        }
    }

    if (parameters.annotationSection.removeStrict || parameters.annotationSection.removeSoft) {
        if (resume && runData.resumeData && runData.resumeData.removeRed) {
            annotationFile = runData.resumeData.annotationFile;
        } else {
            await updateAnnotation(user, runId, 'progress', 'Removing redundancy from annotation ...');
            const removeRedundancyResult = await executeRequest(
                axios.post(`${CONFIG.API_BASE_URL}/run_remove_redundancy`, { 'parameters': parameters, 'annotation_file': annotationFile }),
                user, runId, updateAnnotation
            );
            if (removeRedundancyResult.error) {
                console.error('Error removing redundancy:', removeRedundancyResult.error);
                return;
            }
            console.log('Remove redundancy completed in', removeRedundancyResult.data.timer);
            await updateAnnotation(user, runId, 'timers', {'Removing redundancy from annotation ...': removeRedundancyResult.data.timer})
            console.log(removeRedundancyResult.data.data.sequence_removed, 'sequences removed');
            annotationFile = removeRedundancyResult.data.data.annotation_file;
            console.log('Annotation file after removing redundancy:', annotationFile);
            await updateAnnotation(user, runId, 'resumeData', {'annotationFile': annotationFile, 'removeRed': true});
        }
    }

    if (!parameters.brownamingSection.skip) {
        if (resume && runData.resumeData && runData.resumeData.brownaming) {
            annotationFile = runData.resumeData.annotationFile;
        } else {
            await updateAnnotation(user, runId, 'progress', 'Running Brownaming ...');
            const brownamingResult = await runLongRouteStep({
                startPath: '/run_brownaming_async',
                statusPath: `/check_brownaming_status/${runId}`,
                payload: {
                    'parameters': parameters,
                    'annotation_file': annotationFile,
                    'run_id': runId,
                    'cpus': parameters.cpus,
                    'resume': resume
                },
                stepLabel: 'Running Brownaming ...',
                user,
                runId,
                updateAnnotation
            });
            if (!brownamingResult) {
                console.error('Error running Brownaming');
                return;
            }
            console.log('Brownaming completed in', brownamingResult.timer);
            await updateAnnotation(user, runId, 'timers', {'Running Brownaming ...': brownamingResult.timer})
            annotationFile = `runs/${runId}/${brownamingResult.data.output_files.fasta}`;
            console.log('Brownaming annotation file:', annotationFile);
            await updateAnnotation(user, runId, 'resumeData', {
                'annotationFile': annotationFile, 
                'brownaming': true,
                'brownamingResults': brownamingResult.data.output_files,
                'brownaming_dir': brownamingResult.data.brownaming_dir
            });
        }
    }

    if (parameters.buscoSection.annotation && !(resume && runData.resumeData && runData.resumeData.buscoAnnotation)) {
        await updateAnnotation(user, runId, 'progress', 'Running BUSCO on annotation ...');
        console.log('Running BUSCO on annotation with file:', annotationFile);
        const buscoAnnotationResult = await runLongRouteStep({
            startPath: '/run_busco_async',
            statusPath: `/check_busco_status/${runId}`,
            statusQuery: { mode: 'proteins' },
            payload: { 'parameters': parameters, 'input_file': annotationFile, 'mode': 'proteins' },
            stepLabel: 'Running BUSCO on annotation ...',
            user,
            runId,
            updateAnnotation
        });
        if (!buscoAnnotationResult) {
            console.error('Error running BUSCO on annotation');
            return;
        }
        console.log('BUSCO on annotation completed in', buscoAnnotationResult.timer);
        await updateAnnotation(user, runId, 'timers', {'Running BUSCO on annotation ...': buscoAnnotationResult.timer})
        let buscoAnnotationResultData = buscoAnnotationResult.data;
        console.log('BUSCO annotation result:', buscoAnnotationResultData);
        await updateAnnotation(user, runId, 'resumeData', {'buscoAnnotation': true});
    }
    const setAnnotationCompletedResult = await executeRequest(
        await axios.post(`${CONFIG.API_BASE_URL}/set_annotation_completed`, { 'run_id': runId, 'annotation_file': annotationFile }),
        user, runId, updateAnnotation, true
    );
    if (setAnnotationCompletedResult.error) {
        console.error('Error setting annotation as completed:', setAnnotationCompletedResult.error);
        return;
    }
}
