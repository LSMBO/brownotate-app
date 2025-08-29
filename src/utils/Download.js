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

export async function downloadNCBI(download_command) {
    try {
        const response = await axios.post(`${CONFIG.API_BASE_URL}/download_ncbi`, {
            'download_command': download_command,
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


export async function mergeFastaFiles(files) {
    try {
        const response = await axios.post(`${CONFIG.API_BASE_URL}/merge_fasta_files`, {
            'files': files
        });
        return response.data.path;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

export async function handleClickDownload(data, type, downloadToClient) {
    if (type === 'proteins') {
        let output = null;
        let proteinFiles = [];
        const downloadPromises = data.map(async (proteins) => {
            if (proteins.database === "UniprotKB") {
                output = await downloadUniprot(proteins.download_url, `${proteins.accession}.fasta`);
            } else if (proteins.database === "ENSEMBL") {
                output = await downloadEnsemblFTP(proteins.download_url, proteins.accession, 'proteins');
            } else if (proteins.database === "NCBI") {
                output = await downloadNCBI(proteins.download_command);
            }
            if (output) {
                proteinFiles.push(output);
            }
        });
        await Promise.all(downloadPromises);

        if (proteinFiles.length === 1) {
            const serverFilePath = proteinFiles[0];
            if (downloadToClient) {
                await downloadFromServer(serverFilePath, null);
            } else {
                return serverFilePath;
            }
        } else {
            const mergedFilePath = await mergeFastaFiles(proteinFiles);
            if (downloadToClient) {
                await downloadFromServer(mergedFilePath, null);
            } else {
                return mergedFilePath;
            }
        }
    }
}