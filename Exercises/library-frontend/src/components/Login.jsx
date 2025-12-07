

import React from "react";
import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client/react'
import { LOGIN } from '../App'



const Login = ({ setToken }) => {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            console.log(error.graphQLErrors[0].message)
        }
    })

    useEffect(() => {
        if (result.data) {
            const token = result.data.login.value
            console.log(token)
            setToken(token)
            localStorage.setItem('user-token', token)
        }
    }, [result.data]) 

    const handleLogin = async (event) => {
        event.preventDefault();
        login({ variables: { username, password } });
        setUsername('');
        setPassword('');
        
    };  

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    username <input 
                    type="text" value={username} onChange={({ target }) => setUsername(target.value)}   
                    />
                </div>
                <div>
                    password <input type="password" value={password} onChange={({ target }) => setPassword(target.value)} />
                </div>
                <button type="submit">login</button>
            </form>
        </div>
    );
};

export default Login;







