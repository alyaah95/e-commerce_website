

import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios"; 
import api from "../apis/axiosConfig";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
  });
  const [emailError, setEmailError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [userNameError, setUserNameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  const [submissionError, setSubmissionError] = useState(null); 
  const [loading, setLoading] = useState(false); 

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    
  };

  const handleName = (name) => {
    if (!name.trim()) {
      setNameError("Name Field is Required!");
    } else {
      setNameError(null);
    }
  };

  const handleEmail = (email) => {
    if (!email) {
      setEmailError("Email field is required!");
    } else if (emailRegex.test(email)) {
      setEmailError(null);
    } else {
      setEmailError("Invalid Email");
    }
  };

  const handleUserName = (userName) => {
    if (!userName) {
      setUserNameError("User Name is Required");
    } else if (/\s/.test(userName)) {
      setUserNameError("User Name shouldn't have spaces");
    } else {
      setUserNameError(null);
    }
  };

  const handlePassword = (password) => {
    if (!password) {
      setPasswordError("Password is Required!");
    } else if (!passwordRegex.test(password)) {
      setPasswordError(
        "Password must be at least 8 characters with: 1 uppercase, 1 lowercase, 1 number, and 1 special character"
      );
    } else {
      setPasswordError(null);
    }
  };

  const handleConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) {
      setConfirmPasswordError("You must confirm your password!");
    } else if (confirmPassword !== formData.password) {
      setConfirmPasswordError("It doesn't match your password!");
    } else {
      setConfirmPasswordError(null); 
    }
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();

    
    handleName(formData.name);
    handleEmail(formData.email);
    handleUserName(formData.userName);
    handlePassword(formData.password);
    handleConfirmPassword(formData.confirmPassword);

   
    const currentNameError = !formData.name.trim() ? "Name Field is Required!" : null;
    const currentEmailError = !formData.email ? "Email field is required!" : (emailRegex.test(formData.email) ? null : "Invalid Email");
    const currentUserNameError = !formData.userName ? "User Name is Required" : (/\s/.test(formData.userName) ? "User Name shouldn't have spaces" : null);
    const currentPasswordError = !formData.password ? "Password is Required!" : (!passwordRegex.test(formData.password) ? "Password must be at least 8 characters with: 1 uppercase, 1 lowercase, 1 number, and 1 special character" : null);
    const currentConfirmPasswordError = !formData.confirmPassword ? "You must confirm your password!" : (formData.confirmPassword !== formData.password ? "It doesn't match your password!" : null);

    
    setNameError(currentNameError);
    setEmailError(currentEmailError);
    setUserNameError(currentUserNameError);
    setPasswordError(currentPasswordError);
    setConfirmPasswordError(currentConfirmPasswordError);

    
    if (
      currentNameError ||
      currentEmailError ||
      currentUserNameError ||
      currentPasswordError ||
      currentConfirmPasswordError
    ) {
      setSubmissionError("Please correct the form errors."); 
      return;
    }

    setLoading(true); 
    setSubmissionError(null); 

    try {
      const response = await axios.post(`${api}/auth/register`, {
        email: formData.email,
        password: formData.password,
        username: formData.userName, 
      });

      console.log('Registration successful:', response.data);
      alert('Registration successful! You can now log in.');
      navigate("/login"); 
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        setSubmissionError(error.response.data.message);
      } else {
        setSubmissionError("An unexpected error occurred during registration. Please try again.");
      }
    } finally {
      setLoading(false); 
    }
  };

  return (
    <>
      <form
        className="border border-2"
        onSubmit={handleSubmit}
        style={{
          width: "50%",
          margin: "auto",
          marginTop: "3em",
          padding: "4em",
        }}
      >
        <label htmlFor="name" style={{ display: "block", marginTop: "1em" }}>
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={() => handleName(formData.name)}
          style={{ display: "block", width: "100%", height: "2em" }}
        ></input>
        {nameError && <div style={{ color: "red" }}>{nameError}</div>}
        <label htmlFor="email" style={{ display: "block", marginTop: "1em" }}>
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => handleEmail(formData.email)}
          style={{ display: "block", width: "100%", height: "2em" }}
        ></input>
        {emailError && <div style={{ color: "red" }}>{emailError}</div>}
        <label
          htmlFor="userName"
          style={{ display: "block", marginTop: "1em" }}
        >
          User Name
        </label>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          onBlur={() => handleUserName(formData.userName)}
          style={{ display: "block", width: "100%", height: "2em" }}
        ></input>
        {userNameError && <div style={{ color: "red" }}>{userNameError}</div>}
        <label
          htmlFor="password"
          style={{ display: "block", marginTop: "1em" }}
        >
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={() => handlePassword(formData.password)}
          style={{ display: "block", width: "100%", height: "2em" }}
        ></input>
        {passwordError && <div style={{ color: "red" }}>{passwordError}</div>}
        <label
          htmlFor="confirmPassword"
          style={{ display: "block", marginTop: "1em" }}
        >
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={() => handleConfirmPassword(formData.confirmPassword)}
          style={{ display: "block", width: "100%", height: "2em" }}
        ></input>
        {confirmPasswordError && (
          <div style={{ color: "red" }}>{confirmPasswordError}</div>
        )}

        
        {submissionError && <div style={{ color: "red", marginTop: "1em" }}>{submissionError}</div>}

        <button
          className="btn btn-success"
          type="submit"
          style={{ marginTop: "1em" }}
          disabled={loading} 
        >
          {loading ? "Registering..." : "Submit"}
        </button>
      </form>
    </>
  );
};
export default Register;