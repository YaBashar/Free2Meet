import { useContext } from 'react';
import { AuthContext } from '../components/AuthContext';

function useAuth() {
    const context = useContext(AuthContext);

    if (context === undefined) { // Check if the context value is missing
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}

export { useAuth }