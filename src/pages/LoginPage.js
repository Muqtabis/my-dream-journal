import { useState } from 'react';
import { useLogin } from '../hooks/useLogin'; // ✅ Import the hook

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error } = useLogin(); // ✅ Use the hook

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password); // ✅ Call the login function
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <h3>Log In</h3>

            <label>Email address:</label>
            <input
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
            />

            <label>Password:</label>
            <input
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
            />

            <button>Log in</button>
            {error && <div className="error">{error}</div>}
        </form>
    );
};

export default LoginPage;