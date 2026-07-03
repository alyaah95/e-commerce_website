import { useState } from "react";
import { useNavigate, Link } from "react-router";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, loginFail, setLoading, setError } from "../store/slices/authSlice";
import { fetchCartItems } from "../store/slices/productCart";
import api from "../apis/axiosConfig";
import "./auth.css";

const Login = () => {
  /* ── All original state — completely untouched ── */
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  /* ── New UI-only state: client-side field errors + eye toggle ── */
  const [emailError,    setEmailError]    = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [showPassword,  setShowPassword]  = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  /* ── Validation helpers ── */
  const validateEmail = (val) => {
    if (!val)                     { setEmailError("Email is required."); return false; }
    if (!emailRegex.test(val))    { setEmailError("Please enter a valid email address."); return false; }
    setEmailError(null); return true;
  };

  const validatePassword = (val) => {
    if (!val) { setPasswordError("Password is required."); return false; }
    if (val.length < 6) { setPasswordError("Password must be at least 6 characters."); return false; }
    setPasswordError(null); return true;
  };

  /* ── All original handlers — logic completely untouched ── */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    /* clear field error as user types */
    if (name === "email")    setEmailError(null);
    if (name === "password") setPasswordError(null);
    dispatch(setError(null));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setError(null));

    /* Client-side validation before hitting the server */
    const emailOk    = validateEmail(formData.email);
    const passwordOk = validatePassword(formData.password);
    if (!emailOk || !passwordOk) return;

    dispatch(setLoading(true));

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;
      console.log("Login successful:", user);
      console.log("JWT Token:", token);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch(loginSuccess({ token }));

      const cartResponse  = await dispatch(fetchCartItems()).unwrap();
      const totalQuantity = cartResponse.reduce((sum, item) => sum + item.quantity, 0);

      alert("Logged in successfully!");
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        "An unexpected error occurred during login. Please try again.";
      dispatch(loginFail(errorMessage));
      dispatch(setError(errorMessage));
      alert(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* ── Brand mark ── */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
          </div>
          <span className="auth-brand-name">MyCart Bliss</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue to your account</p>

        {/* Server / Redux error banner */}
        {error && (
          <div className="auth-alert auth-alert--error">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email Address</label>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                className={`auth-input ${emailError ? "auth-input--error" : ""}`}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => validateEmail(formData.email)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            {emailError && <FieldError msg={emailError} />}
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="auth-label-row">
              <label className="auth-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="auth-forgot-link">Forgot password?</Link>
            </div>
            <div className="auth-input-wrap">
              <svg className="auth-input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                className={`auth-input auth-input--padded-r ${passwordError ? "auth-input--error" : ""}`}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={() => validatePassword(formData.password)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((p) => !p)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {passwordError && <FieldError msg={passwordError} />}
          </div>

          {/* Submit */}
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <><div className="auth-btn-spinner" /> Signing in…</>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Sign In
              </>
            )}
          </button>

        </form>

        {/* ── Don't have an account? ── */}
        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register" className="auth-switch-link">Create one now</Link>
        </p>

      </div>
    </div>
  );
};

/* Shared inline field error — identical component used in Register */
const FieldError = ({ msg }) => (
  <span className="auth-field-error">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    {msg}
  </span>
);

export default Login;