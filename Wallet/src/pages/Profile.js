import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
const Profile = () => {
const { user, isAuthenticated, isLoading } = useAuth0();
if (isLoading) return <div>Cargando...</div>;

return (
    isAuthenticated && (
        <div>
            <h2>Bienvenido, {user.name}</h2>
            <p>Email: {user.email}</p>
            <img src={user.picture} alt={user.name} />
        </div>
    )
);
};

export default Profile;