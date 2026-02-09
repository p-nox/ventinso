import { createContext, useContext, useState } from 'react';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("authenticatedUser") !== null);
  const [username, setUsername] = useState(localStorage.getItem("authenticatedUser") || null);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [userAvatar, setUserAvatar] = useState(localStorage.getItem("userAvatar") || null);
  
  const [watchlist, setWatchlist] = useState(() => {
    const stored = localStorage.getItem("watchlist");
    return stored ? JSON.parse(stored) : [];
  });


  const createSession = (token, userId, username) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("authenticatedUser", username);
  };

  const clearSession = () => {
    localStorage.clear();
  };

  const login = (token, userData) => {
    const rawToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt_decode(rawToken);

    createSession(token, decoded.userId, decoded.sub);

    setUserId(decoded.userId);
    setUsername(decoded.sub);

    const userAvatar = userData.avatarUrl;
    setUserAvatar(userAvatar);
    localStorage.setItem("userAvatar", userAvatar);

    const ids = userData.watchlist
      .map(item => item.itemId)
      .filter(id => id !== undefined);
    setWatchlist(ids);
    localStorage.setItem("watchlist", JSON.stringify(ids));

    setIsLoggedIn(true);
  };

  const logout = () => {
    clearSession(); 
    setUserId(null);
    setUsername(null);
    setUserAvatar(null); 
    setWatchlist([]);
    setIsLoggedIn(false);
  };


  

  const checkLoggedIn = () => localStorage.getItem("authenticatedUser") !== null;

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userId,
      username,
      watchlist,
      userAvatar,
      setUserAvatar,
      login,
      logout,
      checkLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
