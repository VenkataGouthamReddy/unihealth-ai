import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Always use the explicit API URL if provided (crucial for mobile web/PWA deployments), 
  // otherwise fallback to relative path (Vite proxy/production).
  axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';
  axios.defaults.timeout = 60000; // 60s timeout to accommodate cloud server spin-up

  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config } = error;
      
      // Do not retry 4xx client errors (e.g. 401 Incorrect credentials)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        return Promise.reject(error);
      }

      if (!config) {
        return Promise.reject(error);
      }

      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount >= 4) {
        return Promise.reject(error);
      }
      
      config.__retryCount += 1;
      // Wait 2s backoff between retries for cloud cold starts
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return axios(config);
    }
  );

  useEffect(() => {
    // A real app would verify the token with the backend here.
    const initAuth = async () => {
        const token = localStorage.getItem('token');
        if (token && token.split('.').length === 3) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ 
                  id: payload.id,
                  email: payload.sub, 
                  role: payload.role, 
                  name: payload.name, 
                  profile_picture: payload.profile_picture 
                });
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setToken(token);
            } catch (e) {
                console.error("Invalid token format", e);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    try {
      const res = await axios.post('/auth/login', formData);
      const newToken = res.data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      const newUser = { id: payload.id, email: payload.sub, role: payload.role, name: payload.name, profile_picture: payload.profile_picture };
      setUser(newUser);
      return newUser;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  };

  const sendOtp = async (name, email, password, role) => {
    try {
      const res = await axios.post('/auth/send-otp', { name, email, password, role });
      return res.data;
    } catch (err) {
      console.error("OTP Send error:", err);
      throw err;
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await axios.post('/auth/verify-otp', { email, otp });
      const newToken = res.data.access_token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      const newUser = { id: payload.id, email: payload.sub, role: payload.role, name: payload.name, profile_picture: payload.profile_picture };
      setUser(newUser);
      return newUser;
    } catch (err) {
      console.error("OTP Verify error:", err);
      throw err;
    }
  };

  const changePassword = async (old_password, new_password) => {
    try {
      await axios.post('/auth/change-password', { old_password, new_password });
    } catch (err) {
      console.error("Change Password error:", err);
      throw err;
    }
  };

  const uploadProfilePicture = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/auth/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(prev => ({ ...prev, profile_picture: res.data.profile_picture }));
      return res.data;
    } catch (err) {
      console.error("Upload error:", err);
      throw err;
    }
  };

  const removeProfilePicture = async () => {
    try {
      const res = await axios.delete('/auth/profile-picture');
      setUser(prev => ({ ...prev, profile_picture: null }));
      return res.data;
    } catch (err) {
      console.error("Remove picture error:", err);
      throw err;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axios.put('/auth/update-profile', profileData);
      setUser(prev => ({ ...prev, ...res.data }));
      return res.data;
    } catch (err) {
      console.error("Profile Update error:", err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, sendOtp, verifyOtp, changePassword, uploadProfilePicture, removeProfilePicture, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
