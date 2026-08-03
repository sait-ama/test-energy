import { useRef, useState } from 'react';
import { useLogin, useNotify } from 'react-admin';

import { Button, TextField } from '@mui/material';

export const LoginPage = () => {
    const captchaRef = useRef();
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const login = useLogin();
    const notify = useNotify();

    const handleSubmit = async (e) => {
        e.preventDefault();
        // const token = await captchaRef.current.getResponse();
        // 'g-recaptcha-response': token
        login({ user, password }).catch(() => notify('Invalid email or password'));
    };

    return (
        <div className="flex h-screen">
            <form onSubmit={handleSubmit} className="flex m-auto flex-col" style={{ width: 400 }}>
                <TextField
                    name="user"
                    variant="outlined"
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                />
                <TextField
                    variant="outlined"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <div style={{ height: 20 }} />
                {/*<Reaptcha sitekey={import.meta.env.VITE_RECAPTCHA_KEY} ref={captchaRef} />*/}
                <div style={{ height: 20 }} />
                <Button onClick={handleSubmit}>Войти</Button>
            </form>
        </div>
    );
};
