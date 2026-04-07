
import axios from 'axios';
import CONFIG from '../config';


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
                const fastpResult = await executeRequest(
                    axios.post(`${CONFIG.API_BASE_URL}/run_fastp`, { 'parameters': parameters, 'sequencing_file_list': sequencingFileList }),
                    user, runId, updateAnnotation
                );
                if (fastpResult.error) {
                    console.error('Error running fastp:', fastpResult.error);
                    return;
                }
                console.log('fastpResult:', fastpResult);
                console.log('Fastp completed in', fastpResult.data.timer);
                await updateAnnotation(user, runId, 'timers', {'Running fastp on sequencing files ...': fastpResult.data.timer})
                sequencingFileListAfterFastp = fastpResult.data.data;
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
                const removePhixResult = await executeRequest(
                    axios.post(`${CONFIG.API_BASE_URL}/run_remove_phix`, { 'parameters': parameters, 'sequencing_file_list': sequencingFileListAfterFastp }),
                    user, runId, updateAnnotation
                );
                if (removePhixResult.error) {
                    console.error('Error removing Phix:', removePhixResult.error);
                    return;
                }
                console.log('removePhixResult:', removePhixResult);
                console.log('Remove Phix completed in', removePhixResult.data.timer);
                await updateAnnotation(user, runId, 'timers', {'Removing Phix from sequencing files ...': removePhixResult.data.timer})
                sequencingFileListAfterRemovePhix = removePhixResult.data.data;
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
                    // CANU not completed yet - start or continue polling
                    let shouldStartCanu = true;
                    
                    // If resuming and CANU status is 'running', skip the start call and go straight to polling
                    if (resume && runData.resumeData && runData.resumeData.canu_status === 'running') {
                        console.log('[CANU] CANU already running, resuming polling...');
                        shouldStartCanu = false;
                    }
                    
                    if (shouldStartCanu) {
                        await updateAnnotation(user, runId, 'progress', 'Running CANU assembly ...');
                        console.log('[CANU] Starting CANU assembly request...');
                        console.log('[CANU] CANU will run in background. Polling every 30 seconds...');
                        
                        const startCanuResult = await executeRequest(
                            axios.post(`${CONFIG.API_BASE_URL}/run_canu`, { 
                                'parameters': parameters, 
                                'sequencing_file_list': sequencingFileListProcessed 
                            }),
                            user, runId, updateAnnotation
                        );
                        
                        if (startCanuResult.error || startCanuResult.data.status !== 'started') {
                            console.error('[CANU] Failed to start:', startCanuResult);
                            return;
                        }
                        
                        console.log('[CANU] Started successfully, now polling for completion...');
                    }
                    
                    // Polling loop (works for both new runs and resumed runs)
                    const pollCanuStatus = async () => {
                        while (true) {
                            await new Promise(resolve => setTimeout(resolve, 30000));
                            
                            try {
                                const statusResponse = await axios.get(
                                    `${CONFIG.API_BASE_URL}/check_canu_status/${runId}`
                                );
                                
                                console.log('[CANU] Status check:', statusResponse.data.status);
                                
                                if (statusResponse.data.status === 'completed') {
                                    console.log('[CANU] Assembly completed successfully!');
                                    console.log('[CANU] Assembly file:', statusResponse.data.assemblyFile);
                                    console.log('[CANU] Timer:', statusResponse.data.timer);
                                    if (statusResponse.data.stdout_file) {
                                        console.log('[CANU] Stdout log:', statusResponse.data.stdout_file);
                                    }
                                    if (statusResponse.data.stderr_file) {
                                        console.log('[CANU] Stderr log:', statusResponse.data.stderr_file);
                                    }
                                    assemblyFile = statusResponse.data.assemblyFile;
                                    return;
                                } else if (statusResponse.data.status === 'error') {
                                    console.error('[CANU] Error detected:', statusResponse.data.error);
                                    await updateAnnotation(user, runId, 'status', 'failed');
                                    await updateAnnotation(user, runId, 'error', 
                                        `CANU failed: ${statusResponse.data.error}`);
                                    throw new Error(statusResponse.data.error);
                                }
                            } catch (error) {
                                console.error('[CANU] Polling error:', error);
                                if (error.response?.data?.status === 'error') {
                                    throw error;
                                }
                                // Don't throw on network errors - continue polling
                                console.log('[CANU] Network error during polling, will retry...');
                            }
                        }
                    };
                    
                    await pollCanuStatus();
                    console.log('[CANU] Continuing workflow with assembly:', assemblyFile);
                }
                
            } else {
                await updateAnnotation(user, runId, 'progress', 'Running Megahit assembly ...');
                const megahitResult = await executeRequest(
                    axios.post(`${CONFIG.API_BASE_URL}/run_megahit`, { 'parameters': parameters, 'sequencing_file_list': sequencingFileListProcessed }),
                    user, runId, updateAnnotation
                );
                if (megahitResult.error) {
                    console.error('Error running Megahit:', megahitResult.error);
                    return;
                } 
                console.log('Megahit completed in', megahitResult.data.timer);
                await updateAnnotation(user, runId, 'timers', {'Running Megahit assembly ...': megahitResult.data.timer})
                assemblyFile = megahitResult.data.data;
                await updateAnnotation(user, runId, 'resumeData', {'assemblyFile': assemblyFile});
            }
        }    
    } else {
        assemblyFile = parameters.startSection.assemblyFileOnServer;
    }

    console.log('Assembly file:', assemblyFile);

    if (parameters.buscoSection.assembly && !(resume && runData.resumeData && runData.resumeData.buscoAssembly)) {
        await updateAnnotation(user, runId, 'progress', 'Running BUSCO on assembly ...');
        const buscoAssemblyResult = await executeRequest(
            axios.post(`${CONFIG.API_BASE_URL}/run_busco`, { 'parameters': parameters, 'input_file': assemblyFile, 'mode': 'genome' }),
            user, runId, updateAnnotation
        );
        if (buscoAssemblyResult.error) {
            console.error('Error running BUSCO on assembly:', buscoAssemblyResult.error);
            return;
        }
        console.log('BUSCO on assembly completed in', buscoAssemblyResult.data.timer);
        await updateAnnotation(user, runId, 'timers', {'Running BUSCO on assembly ...': buscoAssemblyResult.data.timer})
        let buscoAssemblyResultData = buscoAssemblyResult.data.data;
        console.log('BUSCO assembly result:', buscoAssemblyResultData);
        await updateAnnotation(user, runId, 'resumeData', {'buscoAssembly': true});
    }

    if (parameters.species.is_bacteria) {
        if (resume && runData.resumeData && runData.resumeData.annotationFile) {
            annotationFile = runData.resumeData.annotationFile;
        } else {
            await updateAnnotation(user, runId, 'progress', 'Running Prokka annotation ...');
            const prokkaResult = await executeRequest(
                axios.post(`${CONFIG.API_BASE_URL}/run_prokka`, { 'parameters': parameters, 'assembly_file': assemblyFile }),
                user, runId, updateAnnotation
            );
            if (prokkaResult.error) {
                console.error('Error running Prokka:', prokkaResult.error);
                return;
            }
            console.log('Prokka completed in', prokkaResult.data.timer);
            await updateAnnotation(user, runId, 'timers', {'Running Prokka annotation ...': prokkaResult.data.timer})
            annotationFile = prokkaResult.data.data;
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
            const scipioResult = await executeRequest(
                axios.post(`${CONFIG.API_BASE_URL}/run_scipio`, { 'parameters': parameters, 'split_assembly_files': splitAssemblyFiles, 'evidence_file': evidenceFile, 'flex': false }),
                user, runId, updateAnnotation
            );
            if (scipioResult.error) {
                console.error('Error running Scipio:', scipioResult.error);
                return;
            }
            console.log('Scipio completed in', scipioResult.data.timer);
            await updateAnnotation(user, runId, 'timers', {'Running Scipio ...': scipioResult.data.timer})
            genesRaw = scipioResult.data.data;
            console.log('genesRaw:', genesRaw);
            await updateAnnotation(user, runId, 'resumeData', {'genesRaw': genesRaw, 'scipioFlex':false});
        }

        if (resume && runData.resumeData && runData.resumeData.numGenes) {
            numGenes = runData.resumeData.numGenes;
        } else {
            await updateAnnotation(user, runId, 'progress', 'Running gene prediction model ...');
            const modelResult = await executeRequest(
                axios.post(`${CONFIG.API_BASE_URL}/run_model`, { 'parameters': parameters, 'genesraw': genesRaw }),
                user, runId, updateAnnotation
            );
            if (modelResult.error) {
                console.error('Error running gene prediction model:', modelResult.error);
                return;
            }
            console.log('Gene prediction model completed in', modelResult.data.timer);
            await updateAnnotation(user, runId, 'timers', {'Running gene prediction model ...': modelResult.data.timer})
            numGenes = modelResult.data.data;
            console.log('Number of genes predicted:', numGenes);
            await updateAnnotation(user, runId, 'resumeData', {'numGenes': numGenes, 'scipioFlex':false});
        }

        if (numGenes < 200 && !(resume && runData.resumeData && runData.resumeData.scipioFlex) ) {
            await updateAnnotation(user, runId, 'progress', `Less than 200 genes predicted (${numGenes}), retrying with more flexible Scipio ...`);
            const scipioFlexResult = await executeRequest(
                axios.post(`${CONFIG.API_BASE_URL}/run_scipio`, { 'parameters': parameters, 'split_assembly_files': splitAssemblyFiles, 'evidence_file': evidenceFile, 'flex': true }),
                user, runId, updateAnnotation
            );
            if (scipioFlexResult.error) {
                console.error('Error running flexible Scipio:', scipioFlexResult.error);
                return;
            }
            console.log('Flexible Scipio completed in', scipioFlexResult.data.timer);
            await updateAnnotation(user, runId, 'timers', {'Running flexible Scipio ...': scipioFlexResult.data.timer})
            genesRaw = scipioFlexResult.data.data;
            console.log('genesRaw:', genesRaw);
            await updateAnnotation(user, runId, 'resumeData', {'genesRaw': genesRaw, 'scipioFlex':true});
        }

        if (numGenes < 200) {
            await updateAnnotation(user, runId, 'progress', 'Running gene prediction model after flexible Scipio ...');
            const modelFlexResult = await executeRequest(
                axios.post(`${CONFIG.API_BASE_URL}/run_model`, { 'parameters': parameters, 'genesraw': genesRaw }),
                user, runId, updateAnnotation
            );
            if (modelFlexResult.error) {
                console.error('Error running gene prediction model again:', modelFlexResult.error);
                return;
            }
            console.log('Gene prediction model after flexible Scipio completed in', modelFlexResult.data.timer);
            await updateAnnotation(user, runId, 'timers', {'Running gene prediction model after flexible Scipio ...': modelFlexResult.data.timer})
            numGenes = modelFlexResult.data.data;
            console.log('Number of genes predicted after flexible Scipio:', numGenes);


            if (numGenes < 200) {
                console.log('Less than 200 genes predicted, stopping annotation run.');
                await updateAnnotation(user, runId, 'progress', 'Annotation run stopped due to insufficient gene predictions (<200).');
                return;
            }
        }

        if (!(resume && runData.resumeData && runData.resumeData.modelOptimized)) {
            await updateAnnotation(user, runId, 'progress', 'Optimizing gene prediction model ...');
            const optimizeModelResult = await executeRequest(
                axios.post(`${CONFIG.API_BASE_URL}/run_optimize_model`, { 'parameters': parameters, 'num_genes': numGenes }),
                user, runId, updateAnnotation
            );
            if (optimizeModelResult.error) {
                console.error('Error optimizing gene prediction model:', optimizeModelResult.error);
                return;
            }
            console.log('Gene prediction model optimization completed in', optimizeModelResult.data.timer);
            await updateAnnotation(user, runId, 'timers', {'Optimizing gene prediction model ...': optimizeModelResult.data.timer})
            await updateAnnotation(user, runId, 'resumeData', {'modelOptimized': true});
        }
        
        if (resume && runData.resumeData && runData.resumeData.annotationFile) {
            annotationFile = runData.resumeData.annotationFile;
        } else {    
            await updateAnnotation(user, runId, 'progress', 'Running Augustus annotation ...');
            const augustusResult = await executeRequest(
                axios.post(`${CONFIG.API_BASE_URL}/run_augustus`, { 'parameters': parameters, 'split_assembly_files': splitAssemblyFiles }),
                user, runId, updateAnnotation
            );
            if (augustusResult.error) {
                console.error('Error running Augustus:', augustusResult.error);
                return;
            }
            console.log('Augustus annotation completed in', augustusResult.data.timer);
            await updateAnnotation(user, runId, 'timers', {'Running Augustus annotation ...': augustusResult.data.timer})
            annotationFile = augustusResult.data.data;
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
            const brownamingResult = await executeRequest(
                axios.post(`${CONFIG.API_BASE_URL}/run_brownaming`, { 
                    'parameters': parameters, 
                    'annotation_file': annotationFile,
                    'run_id': runId,
                    'cpus': parameters.cpus,
                    'resume': resume
                }),
                user, runId, updateAnnotation
            );
            if (brownamingResult.error) {
                console.error('Error running Brownaming:', brownamingResult.error);
                return;
            }
            console.log('Brownaming completed in', brownamingResult.data.timer);
            await updateAnnotation(user, runId, 'timers', {'Running Brownaming ...': brownamingResult.data.timer})
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
        const buscoAnnotationResult = await executeRequest(
            axios.post(`${CONFIG.API_BASE_URL}/run_busco`, { 'parameters': parameters, 'input_file': annotationFile, 'mode': 'proteins' }),
            user, runId, updateAnnotation
        );
        if (buscoAnnotationResult.error) {
            console.error('Error running BUSCO on annotation:', buscoAnnotationResult.error);
            return;
        }
        console.log('BUSCO on annotation completed in', buscoAnnotationResult.data.timer);
        await updateAnnotation(user, runId, 'timers', {'Running BUSCO on annotation ...': buscoAnnotationResult.data.timer})
        let buscoAnnotationResultData = buscoAnnotationResult.data.data;
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
