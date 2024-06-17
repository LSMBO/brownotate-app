import axios from 'axios';

async function downloadUniprotFasta(url, outputName) {
    let allSequences = '';
    try {
        let response = await fetchUrl(url);
        allSequences += await response.text();
        // Pagination through next pages
        while (response.headers.get('Link')) {
            const nextUrl = getNextPageUrl(response.headers.get('Link'));
            response = await fetchUrl(nextUrl);
            allSequences += await response.text();
        }
        saveFastaFile(allSequences, outputName);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function fetchUrl(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Request failed');
    }
    return response;
}

function getNextPageUrl(linkHeader) {
    const nextUrlRegex = /<([^>]+)>;\s*rel="next"/;
    const match = nextUrlRegex.exec(linkHeader);
    return match ? match[1] : null;
}

function saveFastaFile(content, outputName) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


function downloadFTP(path) {
    const link = document.createElement('a');
    link.href = path;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function downloadFromServer(path, extension) {
    try {
        let fileList = [path]
        if (extension) {
            const response = await axios.post(`http://134.158.151.129:80/server_path`, {'path': path, 'extension': extension});
            fileList = response.data.results
        }
        for (let file of fileList) {
            const fileResponse = await axios({
                method: 'post',
                url: `http://134.158.151.129:80/download_file`,
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

export function handleClickDownload(path, type, extension = null) {
    if (type === 'uniprot') {
        downloadUniprotFasta(path[0], `${path[1]}.fasta`);
    } else if (type === 'ftp') {
        downloadFTP(path);
    } else if (type === 'server') {
        downloadFromServer(path, extension);
    }
}