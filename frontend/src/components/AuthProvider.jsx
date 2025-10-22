import { useState } from 'react';
import { AuthContext } from './AuthContext';

function AuthProvider({children}) {
    const [userId, setUserId] = useState('');
    const [accessToken, setAccessToken] = useState('')

    const signUp = (newUserId) => {
        setUserId(newUserId);
    }

    const signIn = (accessToken) => {
        setAccessToken(accessToken);
        console.log("Setting accessToken", accessToken);
    }

    const signOut = () => {
        setUserId(null);
        setAccessToken(null);
    }

    const contextValue = {
        userId, 
        accessToken,
        signUp, 
        signOut,
        signIn
    }

    return (
        <AuthContext.Provider value = {contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthProvider }