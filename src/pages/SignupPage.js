import { useState } from 'react';
import { useSignup } from '../hooks/useSignup'; // ✅ Import the hook

const SignupPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup, error } = useSignup(); // ✅ Use the hook

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signup(email, password); // ✅ Call the signup function
    };

    return (
        <form className="signup-form" onSubmit={handleSubmit}>
            <h3>Sign Up</h3>

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

            <button>Sign up</button>
            {error && <div className="error">{error}</div>}
        </form>
    );
};

export default SignupPage;