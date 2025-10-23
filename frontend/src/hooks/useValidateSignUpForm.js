import { useState, useEffect, useMemo, useCallback} from 'react';


export function useValidateSignUpForm() {

    const regex = useMemo(() => ({
        firstName: /^[a-zA-Z0-9 ]{2,10}$/,
        lastName: /^[a-zA-Z0-9 ]{2,10}$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    }), []);

    const [values, setValues] = useState({
        firstName: '', 
        lastName: '',
        password: '',
        email: ''
    });

    const [valid, setValid] = useState({
        firstName: false,
        lastName: false,
        password: false,
        email: false
    });

   
    useEffect(() => {
        const newValid = {};
        for (const key in values) {
            newValid[key] = regex[key].test(values[key]);
        }
        setValid(newValid);

    }, [values, regex])


    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    }, []);
    

     return {values, valid, handleChange};
}