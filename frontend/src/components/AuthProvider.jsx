import { useState } from 'react';
import { AuthContext } from './AuthContext';

function AuthProvider({children}) {
    const [userId, setUserId] = useState('');
    const [accessToken, setAccessToken] = useState('')

    const signOut = () => {
        setUserId(null);
        setAccessToken(null);
    }

    const contextValue = {
        userId, 
        setUserId, 
        accessToken,
        setAccessToken,
        signOut,
    }

    return (
        <AuthContext.Provider value = {contextValue}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthProvider }