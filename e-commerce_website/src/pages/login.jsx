

import { useState } from "react";
import { useNavigate , Link} from "react-router"; 
import axios from "axios"; 
import { useDispatch, useSelector } from 'react-redux'; 
import { loginSuccess, loginFail, setLoading, setError } from '../store/slices/authSlice'; 
import { fetchCartItems } from '../store/slices/productCart'; 
import { setCounterValue } from '../store/slices/counter'; 
import api from '../apis/axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

 
  const { loading, error } = useSelector((state) => state.auth); 

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setError(null)); 
    dispatch(setLoading(true)); 

   
    if (!formData.email || !formData.password) {
      dispatch(setError("Email and password are required.")); 
      dispatch(setLoading(false)); 
      return;
    }

    try {
      const response = await api.post('/auth/login', {
        email: formData.email, 
        password: formData.password,
      });

      
      const { token, user } = response.data;
      console.log("Login successful:", user);
      console.log("JWT Token:", token);

     
      localStorage.setItem('token', token);
    
      localStorage.setItem('user', JSON.stringify(user)); 

      
      dispatch(loginSuccess({ token })); 

      
      const cartResponse = await dispatch(fetchCartItems()).unwrap(); 
      const totalQuantity = cartResponse.reduce((sum, item) => sum + item.quantity, 0);
      dispatch(setCounterValue(totalQuantity)); 

      alert("Logged in successfully!");
      navigate("/"); 

    } catch (err) {
      console.error("Login failed:", err);
    
      const errorMessage = err.response && err.response.data && err.response.data.message
                           ? err.response.data.message
                           : "An unexpected error occurred during login. Please try again.";
      dispatch(loginFail(errorMessage)); 
      dispatch(setError(errorMessage)); 
      alert(errorMessage);
    } finally {
      dispatch(setLoading(false)); 
    }
  };

  return (
    <div style={{ width: "50%", margin: "auto", marginTop: "3em", padding: "4em", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1.5em" }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email" style={{ display: "block", marginBottom: "0.5em" }}>
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={{ display: "block", width: "100%", padding: "0.5em", marginBottom: "1em", borderRadius: "4px", border: "1px solid #ddd" }}
          required
        />

        <label htmlFor="password" style={{ display: "block", marginBottom: "0.5em" }}>
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          style={{ display: "block", width: "100%", padding: "0.5em", marginBottom: "1.5em", borderRadius: "4px", border: "1px solid #ddd" }}
          required
        />

        <div style={{ marginTop: '10px', textAlign: 'right' }}>
          <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none' }}>
            Forgot Password?
          </Link>
        </div>

       
        {error && <div style={{ color: "red", marginBottom: "1em" }}>{error}</div>}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ display: "block", width: "100%", padding: "0.75em", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          disabled={loading} 
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;