import React, { useEffect, useState } from 'react';
import CONFIG from '../config';
import axios from 'axios';

const PhylogenyMap = ({ file }) => {
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        const fetchImage = async () => {
            try {
                const response = await axios.get(`${CONFIG.API_BASE_URL}/get_phylogeny_map/${file}`, {
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