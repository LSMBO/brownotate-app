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

export function handleClickDownload(data) {
    if (data.database === 'uniprot') {
        downloadUniprotFasta(data.downloadURL, `${data.accession}.fasta`)
    } else {
        const link = document.createElement('a');
        link.href = data.downloadURL;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
