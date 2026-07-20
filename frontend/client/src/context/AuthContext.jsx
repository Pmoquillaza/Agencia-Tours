import {

    createContext,
    useContext,
    useCallback,
    useMemo,
    useState

} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(() => {

        const token = localStorage.getItem("token");

        const usuario = localStorage.getItem("usuario");

        if (token && usuario) {

            return JSON.parse(usuario);

        }

        return null;

    });

    const [loading] = useState(false);

    const login = useCallback((token, usuario) => {

        localStorage.setItem("token", token);

        localStorage.setItem(
            "usuario",
            JSON.stringify(usuario)
        );

        setUser(usuario);

    }, []);

    const logout = useCallback(() => {

        localStorage.removeItem("token");

        localStorage.removeItem("usuario");

        setUser(null);

    }, []);

    const updateUser = useCallback((usuario) => {

        localStorage.setItem(
            "usuario",
            JSON.stringify(usuario)
        );

        setUser(usuario);

    }, []);

    const value = useMemo(
        () => ({
            user,
            login,
            logout,
            updateUser,
            loading
        }),
        [
            user,
            login,
            logout,
            updateUser,
            loading
        ]
    );

    return (

        <AuthContext.Provider
            value={value}
        >

            {children}

        </AuthContext.Provider>

    );

};

export const useAuth = () => {

    return useContext(AuthContext);

};
