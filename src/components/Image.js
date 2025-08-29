import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CONFIG from '../config';


const Image = ({ file }) => {
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        if (file) {
            const fetchImage = async () => {
                try {
                    const response = await axios.get(`${CONFIG.API_BASE_URL}/get_image/${file}`, {
                        responseType: 'blob',
                    });
                    const url = URL.createObjectURL(response.data);
                    setImageUrl(url);
                } catch (error) {
                    console.error('Error fetching image:', error);
                }
            };
            fetchImage();
        }
    }, [file]);

    return (
        <div style={{ maxWidth: '100%' }}>
            {imageUrl ? (
                <img src={imageUrl} style={{ maxWidth: '100%' }} />
            ) : (
                <div className="image-loader-spinner"/>
            )}
        </div>
    );
};

export default Image;;