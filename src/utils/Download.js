import axios from 'axios';

async function downloadUniprotFasta(url, outputName, setIsLoading) {
    let allSequences = '';
    try {
        let response = await fetchUrl(url);
        console.log(url)
        allSequences += await response.text();
        // Pagination through next pages
        while (response.headers.get('Link')) {
            const nextUrl = getNextPageUrl(response.headers.get('Link'));
            response = await fetchUrl(nextUrl);
            allSequences += await response.text();
        }
        setIsLoading(false);
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


function downloadFTP(path, setIsLoading) {
    const link = document.createElement('a');
    link.href = path;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    setIsLoading(false)
    link.click();
    document.body.removeChild(link);
}

async function downloadFromServer(path, extension, setIsLoading) {
    try {
        setIsLoading(true);
        let fileList = [path]
        if (extension) {
            const response = await axios.post(`http://134.158.151.129:80/server_path`, {'path': path, 'extension': extension});
            fileList = response.data.results
        }
        for (let file of fileList) {
            const fileResponse = await axios({
                method: 'post',
                url: `http://134.158.151.129:80/download_file_server`,
                data: { file: file },
                responseType: 'blob'
            });
            let url = window.URL.createObjectURL(new Blob([fileResponse.data]));

            const contentType = fileResponse.headers['content-type'];
            console.log(contentType)
            if (contentType.includes('application/zip')) {
                url = window.URL.createObjectURL(new Blob([fileResponse.data], { type: 'application/zip' }));
            }
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.split('/').pop());
            document.body.appendChild(link);
            setIsLoading(false);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export function handleClickDownload(path, type, setIsLoading, extension = null) {
    if (type === 'uniprot') {
        downloadUniprotFasta(path[0], `${path[1]}.fasta`, setIsLoading);
    } else if (type === 'ftp') {
        downloadFTP(path, setIsLoading);
    } else if (type === 'server') {
        downloadFromServer(path, extension, setIsLoading);
    }
}