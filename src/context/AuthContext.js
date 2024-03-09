import { useEffect, useState } from "react";
import { createContext } from "react";
import { auth } from "../components/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // Use square brackets []

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
  
    });
    return () =>{
      unsub();
    }
  }, []);

  return (
    // Added return statement
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
