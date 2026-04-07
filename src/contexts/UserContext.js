import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isGuest, setIsGuest] = useState(false);

    const loginAsGuest = () => {
        setUser('guest');
        setIsGuest(true);
    };

    const loginAsUser = (email) => {
        setUser(email);
        setIsGuest(false);
    };

    const logout = () => {
        setUser(null);
        setIsGuest(false);
    };

    return (
        <UserContext.Provider value={{ user, isGuest, setUser, loginAsGuest, loginAsUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
