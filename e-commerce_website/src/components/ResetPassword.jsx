import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router';
import { resetPassword } from '../store/slices/authSlice';
import { RiLockPasswordLine, RiKey2Line } from 'react-icons/ri'; // أيقونات جذابة
import "./resetPassword.css";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const emailFromUrl = searchParams.get('email') || '';
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);
    const isPending = loading === true;

    const [formData, setFormData] = useState({
        email: emailFromUrl,
        token: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [passwordError, setPasswordError] = useState(null);
    const [submissionError, setSubmissionError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        setFormData(prev => ({ ...prev, email: emailFromUrl }));
    }, [emailFromUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setSubmissionError(null);
    };

    const validateForm = () => {
        if (!passwordRegex.test(formData.newPassword)) {
            setPasswordError("Password must be at least 8 characters with uppercase, lowercase, number, and special character.");
            return false;
        } else if (formData.newPassword !== formData.confirmNewPassword) {
            setPasswordError("Passwords do not match!");
            return false;
        }
        setPasswordError(null);
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const resultAction = await dispatch(resetPassword({
                email: formData.email,
                token: formData.token,
                newPassword: formData.newPassword,
            })).unwrap();
            
            setSuccessMessage("Success! Your password has been updated.");
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setSubmissionError(err || "Something went wrong. Please try again.");
        }
    };

    if (!emailFromUrl) {
        return (
            <div className="container mt-5 text-center text-danger p-5 shadow-sm rounded bg-light">
                <h4><i className="bi bi-exclamation-triangle"></i> Error</h4>
                <p>Missing email parameter. Please restart the process.</p>
            </div>
        );
    }

    return (
        <div className="reset-password-page py-5 bg-light min-vh-100">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <div className="card border-0 shadow-lg p-4 rounded-4">
                            <div className="text-center mb-4">
                                <div className="icon-badge bg-primary-light text-primary mb-3 mx-auto">
                                    <RiLockPasswordLine size={40} />
                                </div>
                                <h2 className="fw-bold">Set New Password</h2>
                                <p className="text-muted small">Enter the 6-digit code sent to <br/> <strong>{emailFromUrl}</strong></p>
                            </div>

                            {successMessage && <div className="alert alert-success border-0 text-center">{successMessage}</div>}
                            {submissionError && <div className="alert alert-danger border-0 text-center">{submissionError}</div>}

                            <form onSubmit={handleSubmit}>
                                {/* حقل الـ Token */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Verification Code</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0"><RiKey2Line /></span>
                                        <input
                                            type="text"
                                            name="token"
                                            className="form-control border-start-0 ps-0"
                                            placeholder="Enter 6-digit code"
                                            maxLength="6"
                                            value={formData.token}
                                            onChange={handleChange}
                                            required
                                            disabled={isPending}
                                        />
                                    </div>
                                </div>

                                {/* حقل كلمة المرور */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                                        placeholder="••••••••"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        required
                                        disabled={isPending}
                                    />
                                </div>

                                {/* تأكيد كلمة المرور */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmNewPassword"
                                        className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                                        placeholder="••••••••"
                                        value={formData.confirmNewPassword}
                                        onChange={handleChange}
                                        required
                                        disabled={isPending}
                                    />
                                    {passwordError && <div className="invalid-feedback">{passwordError}</div>}
                                </div>

                                <button type="submit" className="btn btn-primary w-100 py-2 fw-bold rounded-pill shadow-sm" disabled={isPending}>
                                    {isPending ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span> Updating...</>
                                    ) : 'Reset Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;