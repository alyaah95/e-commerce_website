import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { forgotPassword } from '../store/slices/authSlice';
import { RiMailSendLine } from 'react-icons/ri'; // أيقونة إرسال بريد
import "./forgotPassword.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' }); // لتنظيم رسائل النجاح والخطأ
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.auth);
    
    const isPending = loading === true;
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        try {
            const resultAction = await dispatch(forgotPassword(email)).unwrap();
            setStatus({ type: 'success', message: resultAction });
            
            // التوجيه لصفحة الـ Reset بعد 2.5 ثانية
            setTimeout(() => {
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 2500); 

        } catch (error) {
            setStatus({ type: 'danger', message: "Something went wrong. Please try again later." });
        }
    };

    return (
        <div className="forgot-password-page py-5 bg-light min-vh-100">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-5 col-lg-4">
                        <div className="card border-0 shadow-lg p-4 rounded-4 text-center">
                            {/* أيقونة جذابة في الأعلى */}
                            <div className="icon-badge bg-primary-light text-primary mb-3 mx-auto">
                                <RiMailSendLine size={40} />
                            </div>
                            
                            <h2 className="fw-bold mb-2">Forgot Password?</h2>
                            <p className="text-muted mb-4 small">
                                No worries! Enter your email and we'll send you a 6-digit reset code.
                            </p>
                            
                            {status.message && (
                                <div className={`alert alert-${status.type} border-0 small mb-4`}>
                                    {status.message}
                                </div>
                            )}
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-4 text-start">
                                    <label htmlFor="email" className="form-label fw-semibold ms-1">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="form-control form-control-lg fs-6 rounded-3"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                                
                                <button 
                                    type="submit" 
                                    disabled={isPending} 
                                    className="btn btn-primary w-100 py-2 fw-bold rounded-pill shadow-sm mb-3"
                                >
                                    {isPending ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span> Sending...</>
                                    ) : 'Send Reset Code'}
                                </button>
                                
                                <button 
                                    type="button" 
                                    onClick={() => navigate('/login')} 
                                    className="btn btn-link text-decoration-none text-muted small"
                                >
                                    Back to Login
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;