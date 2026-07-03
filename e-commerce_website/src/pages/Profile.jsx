import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile, logout } from '../store/slices/authSlice';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { useNavigate } from 'react-router';
import './Profile.css';

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* ── All state & logic — completely untouched ── */
    const { user, loading, error, isAuthenticated } = useSelector((state) => state.auth);
    const [passwordSuccessMsg, setPasswordSuccessMsg] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
    });
    const [emailError, setEmailError]         = useState(null);
    const [userNameError, setUserNameError]   = useState(null);
    const [submissionError, setSubmissionError] = useState(null);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (!user && !loading) { dispatch(fetchUserProfile()); }
    }, [dispatch, isAuthenticated, navigate, user, loading]);

    useEffect(() => {
        if (user) {
            setFormData({ username: user.username || '', email: user.email || '' });
        }
    }, [user]);

    const handleEmailValidation = (email) => {
        if (!email) { setEmailError("Email field is required!"); return "Email field is required!"; }
        else if (emailRegex.test(email)) { setEmailError(null); return null; }
        else { setEmailError("Invalid Email format."); return "Invalid Email format."; }
    };

    const handleUserNameValidation = (username) => {
        if (!username) { setUserNameError("User Name is Required"); return "User Name is Required"; }
        else if (/\s/.test(username)) { setUserNameError("User Name shouldn't have spaces"); return "User Name shouldn't have spaces"; }
        else { setUserNameError(null); return null; }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setSubmissionError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionError(null);
        const emailValidation    = handleEmailValidation(formData.email);
        const userNameValidation = handleUserNameValidation(formData.username);
        const isDataChanged = formData.username !== user.username || formData.email !== user.email;
        if (emailValidation || userNameValidation) { setSubmissionError("Please correct the form errors before saving."); return; }
        if (!isDataChanged) { setSubmissionError("No changes detected."); return; }
        try {
            await dispatch(updateUserProfile(formData)).unwrap();
            setIsEditing(false);
            setSubmissionError(null);
        } catch (error) {
            setSubmissionError(`Update failed: ${error}`);
        }
    };

    const handlePasswordSuccess = (message) => {
        setPasswordSuccessMsg(message);
        setIsEditing(false);
    };

    /* ── Loading / error guards ── */
    if (loading && !user) {
        return (
            <div className="prf-fullscreen-center">
                <div className="prf-spinner" />
                <p className="prf-loading-text">Loading your profile…</p>
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="prf-fullscreen-center">
                <div className="prf-error-card">
                    <span className="prf-error-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </span>
                    <h5>Session Error</h5>
                    <p>{error} You may need to log in again.</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="prf-fullscreen-center">
                <div className="prf-spinner" />
                <p className="prf-loading-text">No data available.</p>
            </div>
        );
    }

    /* ── Derived display values ── */
    const displayDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Not available';

    /* Avatar initials — first letter of username */
    const initials = user.username ? user.username.charAt(0).toUpperCase() : '?';

    return (
        <div className="prf-page">
            <div className="prf-container">

                {/* ── Page header ── */}
                <div className="prf-page-header">
                    <h1 className="prf-page-title">My Profile</h1>
                    <p className="prf-page-sub">Manage your personal information and security settings</p>
                </div>

                <div className="prf-layout">

                    {/* ══════════════════════════════
                        LEFT — Avatar card
                    ══════════════════════════════ */}
                    <aside className="prf-sidebar">
                        <div className="prf-avatar-card">
                            <div className="prf-avatar">{initials}</div>
                            <strong className="prf-avatar-name">{user.username}</strong>
                            <span className="prf-avatar-email">{user.email}</span>
                            <div className="prf-avatar-divider" />
                            <div className="prf-avatar-meta">
                                <div className="prf-meta-row">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                    <span>Joined {displayDate}</span>
                                </div>
                            </div>

                            {!isEditing && (
                                <button
                                    className="prf-edit-btn"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* ══════════════════════════════
                        RIGHT — Info / Edit panels
                    ══════════════════════════════ */}
                    <div className="prf-main">

                        {/* Global submission error */}
                        {submissionError && (
                            <div className="prf-alert prf-alert--error">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {submissionError}
                            </div>
                        )}

                        {/* Password success message */}
                        {passwordSuccessMsg && (
                            <div className="prf-alert prf-alert--success">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                {passwordSuccessMsg}
                            </div>
                        )}

                        {isEditing ? (
                            /* ══ EDIT MODE ══ */
                            <>
                                {/* Basic info form */}
                                <div className="prf-panel">
                                    <div className="prf-panel-header">
                                        <div className="prf-panel-icon prf-panel-icon--info">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                            </svg>
                                        </div>
                                        <h2 className="prf-panel-title">Basic Information</h2>
                                    </div>

                                    <form onSubmit={handleSubmit} className="prf-fields">
                                        <div className="prf-field-row">
                                            <div className="prf-field">
                                                <label className="prf-label" htmlFor="username">
                                                    Username
                                                    <span className="prf-label-hint"> (current: {user.username})</span>
                                                </label>
                                                <input
                                                    className={`prf-input ${userNameError ? 'prf-input--error' : ''}`}
                                                    type="text"
                                                    id="username"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    onBlur={() => handleUserNameValidation(formData.username)}
                                                    disabled={loading === 'pending'}
                                                    placeholder="New username"
                                                />
                                                {userNameError && (
                                                    <span className="prf-field-error">
                                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                                        {userNameError}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="prf-field">
                                                <label className="prf-label" htmlFor="email">Email Address</label>
                                                <input
                                                    className={`prf-input ${emailError ? 'prf-input--error' : ''}`}
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    onBlur={() => handleEmailValidation(formData.email)}
                                                    disabled={loading === 'pending'}
                                                    placeholder="new@email.com"
                                                />
                                                {emailError && (
                                                    <span className="prf-field-error">
                                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                                        {emailError}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="prf-form-actions">
                                            <button
                                                type="submit"
                                                className="prf-btn prf-btn--primary"
                                                disabled={loading === 'pending'}
                                            >
                                                {loading === 'pending' ? (
                                                    <>
                                                        <div className="prf-btn-spinner" />
                                                        Saving…
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                                                        </svg>
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                className="prf-btn prf-btn--ghost"
                                                onClick={() => setIsEditing(false)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Change password panel */}
                                <div className="prf-panel">
                                    <div className="prf-panel-header">
                                        <div className="prf-panel-icon prf-panel-icon--lock">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                                            </svg>
                                        </div>
                                        <h2 className="prf-panel-title">Change Password</h2>
                                    </div>
                                    <div className="prf-fields">
                                        {/* ChangePasswordForm component — untouched */}
                                        <ChangePasswordForm onPasswordChangeSuccess={handlePasswordSuccess} />
                                    </div>
                                </div>
                            </>

                        ) : (
                            /* ══ READ-ONLY MODE ══ */
                            <div className="prf-panel">
                                <div className="prf-panel-header">
                                    <div className="prf-panel-icon prf-panel-icon--info">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                        </svg>
                                    </div>
                                    <h2 className="prf-panel-title">Account Details</h2>
                                </div>

                                <div className="prf-info-rows">
                                    <div className="prf-info-row">
                                        <span className="prf-info-label">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                            </svg>
                                            Username
                                        </span>
                                        <span className="prf-info-value">{user.username}</span>
                                    </div>
                                    <div className="prf-info-row">
                                        <span className="prf-info-label">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                                            </svg>
                                            Email
                                        </span>
                                        <span className="prf-info-value">{user.email}</span>
                                    </div>
                                    <div className="prf-info-row prf-info-row--last">
                                        <span className="prf-info-label">
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                            Member Since
                                        </span>
                                        <span className="prf-info-value">{displayDate}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>{/* end prf-main */}
                </div>{/* end prf-layout */}
            </div>
        </div>
    );
};

export default Profile;