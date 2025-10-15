import React from 'react'
import { useState, useEffect } from 'react';

const useValidateLoginForm = () => {

    const [password, setPassword] = useState('');
    const [validPassword, setValidPassword] = useState(false);

    const[email, setEmail] = useState('');
    const[validEmail, setValidEmail] = useState(false);

    useEffect(() => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
        const result = passwordRegex.test(password);
        setValidPassword(result);
    }, [password]);

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    }

    useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const result = emailRegex.test(email);
        setValidEmail(result);
    }, [email]);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    }

    return { password, email, validEmail, validPassword, handleEmailChange, handlePasswordChange }
}

export default useValidateLoginForm;