import { Link } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import { useAuthContext } from '../hooks/useAuthContext';

const Navbar = () => {
    const { logout } = useLogout();
    const { user } = useAuthContext();

    const handleClick = () => {
        logout();
    };

    return (
        <header>
            <div className="container">
                <Link to="/">
                    <h1>🌙 Dream Journal</h1>
                </Link>
                <nav>
                    {/* Publicly Accessible AI Visualizer */}
                    <Link to="/visualizer" className="nav-visualizer-btn">
                        🎨 AI Visualizer
                    </Link>

                    {/* Logged-In User Section */}
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <Link to="/stats">📊 Stats</Link> 
                            <span>{user.email}</span>
                            <button onClick={handleClick}>Log out</button>
                        </div>
                    )}
                    
                    {/* Logged-Out User Section */}
                    {!user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link to="/login">Login</Link>
                            <Link to="/signup">Signup</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
