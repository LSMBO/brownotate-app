import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PhylogenyMap = ({ file }) => {
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await axios.get(`http://134.158.151.55:80/get_phylogeny_map/${file}`, {
                    responseType: 'blob',
                });
                const url = URL.createObjectURL(response.data);
                setImageUrl(url);
            } catch (error) {
                console.error('Error fetching phylogeny map:', error);
            }
        };

        fetchImage();
    }, []);

    return (
        <div>
            <h2 className="home-h2">Phylogeny Map</h2>
            {imageUrl ? (
                <img src={imageUrl} alt="Phylogeny Map" style={{ maxWidth: '100%' }} />
            ) : (
                <p>Loading phylogeny map...</p>
            )}
        </div>
    );
};

export default PhylogenyMap;