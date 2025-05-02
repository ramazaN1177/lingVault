"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser } from '../appwrite/api';
import { useRouter } from "next/navigation";

export interface User {
    id: string;
    name: string;
    email: string;
    username: string;
    imageUrl: string;
    bio: string;
}

export interface AuthContextType {
    user: User;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    checkAuthUser: () => Promise<boolean>;
}

export const INITIAL_USER: User = {
    id: '',
    name: '',
    email: '',
    username: '',
    imageUrl: '',
    bio: '',
};


const INITIAL_STATE: AuthContextType = {
    user: INITIAL_USER,
    isLoading: false,
    isAuthenticated: false,
    setUser: () => {},
    setIsAuthenticated: () => {},
    checkAuthUser: async () => false,
};

const AuthContext = createContext<AuthContextType>(INITIAL_STATE);

interface AuthProviderProps {
    children: ReactNode;
}


const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User>(INITIAL_USER);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const router = useRouter();

    const checkAuthUser = async (): Promise<boolean> => {
        setIsLoading(true);
        try {
            const currentAccount = await getCurrentUser();

            if (currentAccount) {
                setUser({
                    id: currentAccount.$id,
                    name: currentAccount.name,
                    email: currentAccount.email,
                    username: currentAccount.username,
                    imageUrl: currentAccount.imageUrl,
                    bio: currentAccount.bio,
                });
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            console.log(error);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const cookieFallback = localStorage.getItem('cookieFallback');
        if (
            cookieFallback === '[]' ||
            cookieFallback === null ||
            cookieFallback === undefined
        ) {
            router.push('/');
        }

        checkAuthUser();
    }, []);

    const value: AuthContextType = {
        user,
        setUser,
        isLoading,
        isAuthenticated,
        setIsAuthenticated,
        checkAuthUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
export const useUserContext = (): AuthContextType => useContext(AuthContext);
