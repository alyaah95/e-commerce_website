
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../store/slices/authSlice'; 

// 🛑 نفس الـ Regex المستخدمة في Register
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const ChangePasswordForm = ({ onPasswordChangeSuccess }) => {
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state) => state.auth);
    
    // 1. حالة النموذج
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    // 2. حالة الأخطاء (Validation)
    const [currentPasswordError, setCurrentPasswordError] = useState(null);
    const [newPasswordError, setNewPasswordError] = useState(null);
    const [confirmNewPasswordError, setConfirmNewPasswordError] = useState(null);
    const [submissionError, setSubmissionError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setSubmissionError(null); 
    };

    // 3. دوال التحقق من الصحة
    const handlePasswordValidation = (password) => {
        if (!password) {
            return "Password is Required!";
        } else if (!passwordRegex.test(password)) {
            return "Password must be at least 8 characters with: 1 uppercase, 1 lowercase, 1 number, and 1 special character.";
        }
        return null;
    };
    
    const validateForm = () => {
        // التحقق من كلمة المرور الحالية
        if (!formData.currentPassword) {
            setCurrentPasswordError("Current password is required.");
            return false;
        } else {
            setCurrentPasswordError(null);
        }
        
        // التحقق من كلمة المرور الجديدة
        const newPassError = handlePasswordValidation(formData.newPassword);
        setNewPasswordError(newPassError);
        
        // التحقق من تطابق كلمة المرور الجديدة والتأكيد
        if (!formData.confirmNewPassword) {
            setConfirmNewPasswordError("You must confirm your new password!");
        } else if (formData.confirmNewPassword !== formData.newPassword) {
            setConfirmNewPasswordError("New passwords do not match!");
        } else {
            setConfirmNewPasswordError(null);
        }
        
        // التحقق النهائي
        return !newPassError && !currentPasswordError && !confirmNewPasswordError;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionError(null);

        if (!validateForm()) {
            setSubmissionError("Please correct the form errors.");
            return;
        }

        const dataToSubmit = {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
        };

        try {
            const resultAction = await dispatch(changePassword(dataToSubmit)).unwrap();
            
            // النجاح: يتم استدعاء الدالة لتنظيف النموذج في المكون الأب
            onPasswordChangeSuccess(resultAction);
            
            // مسح الحقول بعد النجاح
            setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

        } catch (err) {
            // الفشل: يتم عرض رسالة الخطأ القادمة من الـ Backend (مثل: Current password is incorrect.)
            setSubmissionError(err);
        }
    };
    
    const isPending = loading === true;

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            
            {submissionError && <div style={{ color: "red", marginBottom: '10px' }}>{submissionError}</div>}

            <div style={{ marginBottom: '15px' }}>
                <label>Current password:</label>
                <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    disabled={isPending}
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
                {currentPasswordError && <div style={{ color: "red", fontSize: '0.9em' }}>{currentPasswordError}</div>}
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>New password:</label>
                <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    onBlur={() => handlePasswordValidation(formData.newPassword) && setNewPasswordError(null)}
                    disabled={isPending}
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
                {newPasswordError && <div style={{ color: "red", fontSize: '0.9em' }}>{newPasswordError}</div>}
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>Confirm your new password:</label>
                <input
                    type="password"
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    disabled={isPending}
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
                {confirmNewPasswordError && <div style={{ color: "red", fontSize: '0.9em' }}>{confirmNewPasswordError}</div>}
            </div>

            <button type="submit" disabled={isPending}>
                {isPending ? 'Change is underway...' : 'change password'}
            </button>
        </form>
    );
};

export default ChangePasswordForm;