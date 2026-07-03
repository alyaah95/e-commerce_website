import { useState } from "react";
import { useNavigate, Link } from "react-router";
import axios from "axios";
import api from "../apis/axiosConfig";
import "./auth.css";

const Register = () => {
  /* ── All state — completely untouched ── */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
  });
  const [emailError, setEmailError]                   = useState(null);
  const [nameError, setNameError]                     = useState(null);
  const [userNameError, setUserNameError]             = useState(null);
  const [passwordError, setPasswordError]             = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  const [submissionError, setSubmissionError]         = useState(null);
  const [loading, setLoading]                         = useState(false);

  /* password visibility toggles — new UI-only state */
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirm, setShowConfirm]                 = useState(false);

  const emailRegex    = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const navigate = useNavigate();

  /* ── All handlers — logic completely untouched ── */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleName = (name) => {
    if (!name.trim()) { setNameError("Name is required."); }
    else              { setNameError(null); }
  };

  const handleEmail = (email) => {
    if (!email)                    { setEmailError("Email is required."); }
    else if (emailRegex.test(email)) { setEmailError(null); }
    else                           { setEmailError("Please enter a valid email address."); }
  };

  const handleUserName = (userName) => {
    if (!userName)           { setUserNameError("Username is required."); }
    else if (/\s/.test(userName)) { setUserNameError("Username must not contain spaces."); }
    else                     { setUserNameError(null); }
  };

  const handlePassword = (password) => {
    if (!password)                        { setPasswordError("Password is required."); }
    else if (!passwordRegex.test(password)) { setPasswordError("Min 8 chars with uppercase, lowercase, number & special character."); }
    else                                  { setPasswordError(null); }
  };

  const handleConfirmPassword = (confirmPassword) => {
    if (!confirmPassword)                          { setConfirmPasswordError("Please confirm your password."); }
    else if (confirmPassword !== formData.password) { setConfirmPasswordError("Passwords do not match."); }
    else                                           { setConfirmPasswordError(null); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    handleName(formData.name);
    handleEmail(formData.email);
    handleUserName(formData.userName);
    handlePassword(formData.password);
    handleConfirmPassword(formData.confirmPassword);

    const currentNameError            = !formData.name.trim() ? "Name is required." : null;
    const currentEmailError           = !formData.email ? "Email is required." : (emailRegex.test(formData.email) ? null : "Please enter a valid email address.");
    const currentUserNameError        = !formData.userName ? "Username is required." : (/\s/.test(formData.userName) ? "Username must not contain spaces." : null);
    const currentPasswordError        = !formData.password ? "Password is required." : (!passwordRegex.test(formData.password) ? "Min 8 chars with uppercase, lowercase, number & special character." : null);
    const currentConfirmPasswordError = !formData.confirmPassword ? "Please confirm your password." : (formData.confirmPassword !== formData.password ? "Passwords do not match." : null);

    setNameError(currentNameError);
    setEmailError(currentEmailError);
    setUserNameError(currentUserNameError);
    setPasswordError(currentPasswordError);
    setConfirmPasswordError(currentConfirmPasswordError);

    if (currentNameError || currentEmailError || currentUserNameError || currentPasswordError || currentConfirmPasswordError) {
      setSubmissionError("Please fix the errors above before continuing.");
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
      console.log("Registration successful:", response.data);
      alert("Registration successful! You can now log in.");
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      if (error.response?.data?.message) {
        setSubmissionError(error.response.data.message);
      } else {
        setSubmissionError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">

        {/* ── Brand mark ── */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <span className="auth-brand-name">MyCart Bliss</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Fill in your details to get started</p>

        {/* Global submission error */}
        {submissionError && (
          <div className="auth-alert auth-alert--error">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {submissionError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>

          {/* Row: Name + Username */}
          <div className="auth-field-row">
            <div className="auth-field">
              <label className="auth-label" htmlFor="name">Full Name</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  className={`auth-input ${nameError ? 'auth-input--error' : ''}`}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleName(formData.name)}
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
              {nameError && <FieldError msg={nameError} />}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="userName">Username</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  className={`auth-input ${userNameError ? 'auth-input--error' : ''}`}
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  onBlur={() => handleUserName(formData.userName)}
                  placeholder="john_doe"
                  autoComplete="username"
                />
              </div>
              {userNameError && <FieldError msg={userNameError} />}
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email Address</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                className={`auth-input ${emailError ? 'auth-input--error' : ''}`}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleEmail(formData.email)}
                placeholder="john@example.com"
                autoComplete="email"
              />
            </div>
            {emailError && <FieldError msg={emailError} />}
          </div>

          {/* Row: Password + Confirm Password */}
          <div className="auth-field-row">
            <div className="auth-field">
              <label className="auth-label" htmlFor="password">Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  className={`auth-input auth-input--padded-r ${passwordError ? 'auth-input--error' : ''}`}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handlePassword(formData.password)}
                  placeholder="Min 8 characters"
                  autoComplete="new-password"
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowPassword(p => !p)} aria-label="Toggle password visibility">
                  {showPassword
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {passwordError && <FieldError msg={passwordError} />}
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-input-wrap">
                <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
                <input
                  className={`auth-input auth-input--padded-r ${confirmPasswordError ? 'auth-input--error' : ''}`}
                  type={showConfirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleConfirmPassword(formData.confirmPassword)}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
                <button type="button" className="auth-eye-btn" onClick={() => setShowConfirm(p => !p)} aria-label="Toggle confirm password visibility">
                  {showConfirm
                    ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {confirmPasswordError && <FieldError msg={confirmPasswordError} />}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <><div className="auth-btn-spinner" /> Creating account…</>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Create Account
              </>
            )}
          </button>

        </form>

        {/* Already have an account */}
        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-switch-link">Sign in</Link>
        </p>

      </div>
    </div>
  );
};

/* Shared inline error component */
const FieldError = ({ msg }) => (
  <span className="auth-field-error">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    {msg}
  </span>
);

export default Register;