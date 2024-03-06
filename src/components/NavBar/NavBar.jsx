import { Link } from "react-router-dom";
import * as userService from "../../utilities/users-service";
import AuthPage from "../../pages/AuthPage/AuthPage";

export default function NavBar({user, setUser}){
    function handleLogOut(){
        userService.logOut();
        // Update state will also cause a re-render
        setUser(null);
    }
    return (
        <nav>
            <Link to='/'>homePage</Link>
            
            {/* &nbsp; | &nbsp; */}
            <Link to="/:id" style={{visibility: user ? 'visible' : 'hidden' }}>User Page</Link>
            {/* &nbsp; | &nbsp; */}
            <Link to="/user/:id/rec" style={{visibility: user ? 'visible' : 'hidden' }}>Rec Page</Link>
            <p>Welcome, {user ?  user.name:"new gradener LogIn to continuse"}</p>
            <Link to="" onClick={ handleLogOut } style={{visibility: user ? 'visible' : 'hidden' }} >Log Out</Link>
            <Link to="/auth" style={{visibility: user ? 'hidden' : 'visible' }} >Log in</Link>
            
        </nav>
    );
}