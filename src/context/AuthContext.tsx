import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    khoa_id: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Load user data from sessionStorage on initial load
        const userData = sessionStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            console.log('User data loaded from sessionStorage:', parsedUser);
            setUser(parsedUser);
        }
    }, []);

    const isAdmin = user?.role === 'admin';
    console.log('Current user:', user);
    console.log('Is admin:', isAdmin);

    return (
        <AuthContext.Provider value={{ user, isAdmin, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 