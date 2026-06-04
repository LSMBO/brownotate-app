import axios from 'axios';
import CONFIG from '../config';

export async function downloadUniprot(url, outputName) {
    try {
        const response = await axios.post(`${CONFIG.API_BASE_URL}/download_uniprot`, {
            'url': url,
            'output_name': outputName
        });
        return response.data.path;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

export async function downloadNCBI(download_command, outputPrefix = null) {
    try {
        const command = Array.isArray(download_command) ? [...download_command] : download_command;

        if (outputPrefix && Array.isArray(command)) {
            const filenameFlagIndex = command.findIndex((part) => part === '--filename');
            if (filenameFlagIndex >= 0 && filenameFlagIndex + 1 < command.length) {
                const originalFilename = command[filenameFlagIndex + 1];
                command[filenameFlagIndex + 1] = `${outputPrefix}_${originalFilename}`;
            }
        }

        const response = await axios.post(`${CONFIG.API_BASE_URL}/download_ncbi`, {
            'download_command': command,
        })
        return response.data.path;

    } catch (error) {  
        console.error('Error fetching data:', error);
        return null;
    } 
}

export async function downloadEnsemblFTP(download_url, accession, data_type) {
    try{
        const response = await axios.post(`${CONFIG.API_BASE_URL}/download_ensembl_ftp`, {
            'file': download_url, 
            'output_name': `${accession}_${data_type}.fasta`
        });
        return response.data.path;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

export async function downloadFromServer(path, extension) {
    try {
        console.log(`Requesting download for path: ${path} with extension: ${extension}`);
        let fileList = [path]
        if (extension) {
            const response = await axios.post(`${CONFIG.API_BASE_URL}/server_path`, {'path': path, 'extension': extension});
            fileList = response.data.results
        }
        for (let file of fileList) {
            const fileResponse = await axios({
                method: 'post',
                url: `${CONFIG.API_BASE_URL}/download_server`,
                data: { file: file },
                responseType: 'blob'
            });
            let url = window.URL.createObjectURL(new Blob([fileResponse.data]));

            const contentType = fileResponse.headers['content-type'];
            if (contentType.includes('application/zip')) {
                url = window.URL.createObjectURL(new Blob([fileResponse.data], { type: 'application/zip' }));
            }
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.split('/').pop());
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}


export async function mergeFastaFiles(files, runId) {
    try {
        const response = await axios.post(`${CONFIG.API_BASE_URL}/merge_fasta_files`, {
            'files': files,
            'run_id': runId,
            'merge_scope': runId ? 'run' : 'download'
        });
        return response.data;
    } catch (error) {
        console.error('Error merging FASTA files:', error);
        return null;
    }
}

export async function handleClickDownload(data, type, downloadToClient, runId, withMetadata = false, options = {}) {
    const mergeScope = options.mergeScope || (runId ? 'run' : 'download');
    const selectedCount = Array.isArray(data) ? data.length : 0;
    const isMultiSelection = selectedCount > 1;

    const getDatasetOutputPrefix = (proteins, index) => {
        const raw = [
            proteins?.database || 'db',
            proteins?.accession || 'na',
            proteins?.taxid || 'na',
            index
        ].join('_');
        return raw.replace(/[^a-zA-Z0-9._-]/g, '_');
    };

    if (type === 'proteins') {
        const downloadPromises = data.map(async (proteins, index) => {
            let downloadedPath = null;
            const outputPrefix = getDatasetOutputPrefix(proteins, index);

            if (proteins.database === "UniprotKB" && proteins.download_url) {
                const outputName = isMultiSelection
                    ? `${outputPrefix}.fasta`
                    : `${proteins.accession || outputPrefix}.fasta`;
                downloadedPath = await downloadUniprot(proteins.download_url, outputName);
            } else if (proteins.database === "ENSEMBL" && proteins.download_url) {
                const accessionOrPrefix = isMultiSelection ? outputPrefix : (proteins.accession || outputPrefix);
                downloadedPath = await downloadEnsemblFTP(proteins.download_url, accessionOrPrefix, 'proteins');
            } else if (proteins.database === "NCBI" && proteins.download_command) {
                downloadedPath = await downloadNCBI(
                    proteins.download_command,
                    isMultiSelection ? outputPrefix : null
                );
            }

            return {
                downloadedPath,
                descriptor: `${proteins.database || 'Unknown'}:${proteins.accession || proteins.taxid || index}`
            };
        });

        const downloadResults = await Promise.all(downloadPromises);

        const proteinFiles = downloadResults
            .map((item) => item.downloadedPath)
            .filter((filePath) => (
                typeof filePath === 'string' && filePath.trim() !== '' && filePath.trim().toLowerCase() !== 'none'
            ));

        const failedEntries = downloadResults
            .filter((item) => !(typeof item.downloadedPath === 'string' && item.downloadedPath.trim() !== '' && item.downloadedPath.trim().toLowerCase() !== 'none'))
            .map((item) => item.descriptor);

        if (failedEntries.length > 0) {
            throw new Error(`Some selected protein datasets could not be downloaded: ${failedEntries.join(', ')}`);
        }

        if (proteinFiles.length === 0) {
            console.error('No valid protein evidence file was downloaded.');
            return null;
        }

        if (isMultiSelection && proteinFiles.length !== selectedCount) {
            throw new Error(`Expected ${selectedCount} downloaded datasets, got ${proteinFiles.length}.`);
        }

        const uniqueProteinFiles = [...new Set(proteinFiles)];

        if (!isMultiSelection && uniqueProteinFiles.length === 1) {
            let serverFilePath = uniqueProteinFiles[0];
            let sourceFiles = uniqueProteinFiles;

            if (mergeScope === 'run') {
                const mergeResult = await mergeFastaFiles(uniqueProteinFiles, runId);
                if (!mergeResult || !mergeResult.path) {
                    throw new Error('Failed to prepare evidence file in run directory.');
                }
                serverFilePath = mergeResult.path;
                sourceFiles = mergeResult.source_files || uniqueProteinFiles;
            }

            if (downloadToClient) {
                await downloadFromServer(serverFilePath, null);
                return withMetadata
                    ? { finalFilePath: serverFilePath, sourceFiles, merged: false }
                    : serverFilePath;
            }
            return withMetadata
                ? { finalFilePath: serverFilePath, sourceFiles, merged: false }
                : serverFilePath;
        }

            const filesForMerge = isMultiSelection ? proteinFiles : uniqueProteinFiles;
        const mergeResult = await mergeFastaFiles(filesForMerge, mergeScope === 'run' ? runId : null);

        // In Home mode, if merge is unavailable, download all selected files instead of silently falling back to the first one.
        if (!mergeResult || !mergeResult.path) {
            if (downloadToClient && mergeScope !== 'run') {
                for (const filePath of uniqueProteinFiles) {
                    await downloadFromServer(filePath, null);
                }
                return withMetadata
                    ? { finalFilePath: null, sourceFiles: uniqueProteinFiles, merged: false }
                    : uniqueProteinFiles;
            }
            throw new Error('Failed to merge protein files for evidence selection.');
        }

        const finalFilePath = mergeResult.path;
        const sourceFiles = mergeResult.source_files || uniqueProteinFiles;

        if (downloadToClient) {
            await downloadFromServer(finalFilePath, null);
        }
        return withMetadata
            ? { finalFilePath, sourceFiles, merged: true }
            : finalFilePath;
    }

    return null;
}