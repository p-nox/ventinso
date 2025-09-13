import { createContext, useContext, useState } from 'react';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [isLoggedIn, setIsLoggedIn] = useState(() =>
    localStorage.getItem("authenticatedUser") !== null
  );
  const [username, setUsername] = useState(localStorage.getItem("authenticatedUser") || null);
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
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
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("authenticatedUser");
  };

  const login = (token, watchlistItems = []) => {
    const rawToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt_decode(rawToken);

    createSession(token, decoded.userId, decoded.sub);

    setUserId(decoded.userId);
    setUsername(decoded.sub);
    const ids = watchlistItems.map(item => item.itemId);
    setWatchlist(ids);
    localStorage.setItem("watchlist", JSON.stringify(ids));

    setIsLoggedIn(true);
  };

  const logout = () => {
    clearSession();
    setUserId(null);
    setUsername(null);
    setWatchlist([]);
    localStorage.removeItem("watchlist");
    setIsLoggedIn(false);
  };

  const toggleWatchlist = (itemId) => {
    const id = Number(itemId);
    setWatchlist(prev => {
      const updated = prev.includes(id)
        ? prev.filter(id2 => id2 !== id)
        : [...prev, id];

      localStorage.setItem("watchlist", JSON.stringify(updated));
      return updated;
    });
  };

  const checkLoggedIn = () => localStorage.getItem("authenticatedUser") !== null;

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userId,
      username,
      watchlist,
      login,
      logout,
      toggleWatchlist,
      checkLoggedIn
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
