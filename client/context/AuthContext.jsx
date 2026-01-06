import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";


const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();


export const AuthProvider = ({ children })=>{
    
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    // Check if user is aunthenticated and if so, set the user data and connect the socket
    const checkAuth = async () => {
        try {
            // Calls backend API to verify the token.
            const { data } = await axios.get("/api/auth/check");
            if (data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Login function to handle user aunthentication and socket connection
    // will be used for both login and signup if state = login or state = signup
    const login = async (state, credentials)=> {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success){
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token); // App reload झाल्यावर user login राहतो.
                toast.success(data.message)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Logout function to handle user logout and socket disconnection
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out successfully")
        socket.disconnect();
    }

    // Update profile function to handle user profile updates
    const updateProfile = async (body)=> {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if(data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully")
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    // Connect socket function to handle socket connection and online users updates
    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;

        // Creates socket connection and sends userId to backend.
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        // Manually connects the socket.
        newSocket.connect();
        // Stores socket instance in state. जेणेकरून app मध्ये वापरता येईल.
        setSocket(newSocket);

        // Listens for online users event from backend. त्यामुळे UI मध्ये “online users” दिसतात.
        newSocket.on("getOnlineUsers", (userIds)=> {
            setOnlineUsers(userIds);
        })
    }

    // This useEffect sets the JWT token in axios default headers so that all API requests are authenticated automatically.
    useEffect(()=>{
        if(token){
            // This line attaches the token to all axios requests automatically
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();
    },[])

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
