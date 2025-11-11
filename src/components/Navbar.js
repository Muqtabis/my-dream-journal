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
                    <h1>Dream Journal</h1>
                </Link>
                <nav>
                    {/* Logged-In User Section: Combines Stats, Email, and Logout */}
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {/* The navigation link to the dedicated Stats Page */}
                            <Link to="/stats">📊 Stats</Link> 
                            
                            {/* User Email */}
                            <span>{user.email}</span>
                            
                            {/* Logout Button */}
                            <button onClick={handleClick}>Log out</button>
                        </div>
                    )}
                    
                    {/* Logged-Out User Section */}
                    {!user && (
                        <div>
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