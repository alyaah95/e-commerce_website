import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../store/slices/authSlice';

/* ── Same regex as Register — logic untouched ── */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/* Shared inline field error — matches Profile.jsx's prf-field-error style */
const FieldError = ({ msg }) => (
  <span className="prf-field-error">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    {msg}
  </span>
);

const ChangePasswordForm = ({ onPasswordChangeSuccess }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  /* ── All original state — completely untouched ── */
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [currentPasswordError, setCurrentPasswordError]     = useState(null);
  const [newPasswordError, setNewPasswordError]             = useState(null);
  const [confirmNewPasswordError, setConfirmNewPasswordError] = useState(null);
  const [submissionError, setSubmissionError]               = useState(null);

  /* ── UI-only: password visibility toggles ── */
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* ── All original handlers — logic completely untouched ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setSubmissionError(null);
  };

  const handlePasswordValidation = (password) => {
    if (!password)                        return "Password is required.";
    if (!passwordRegex.test(password))    return "Min 8 chars with uppercase, lowercase, number & special character.";
    return null;
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setCurrentPasswordError("Current password is required.");
      return false;
    } else {
      setCurrentPasswordError(null);
    }

    const newPassError = handlePasswordValidation(formData.newPassword);
    setNewPasswordError(newPassError);

    if (!formData.confirmNewPassword) {
      setConfirmNewPasswordError("Please confirm your new password.");
    } else if (formData.confirmNewPassword !== formData.newPassword) {
      setConfirmNewPasswordError("New passwords do not match.");
    } else {
      setConfirmNewPasswordError(null);
    }

    return !newPassError && !currentPasswordError && !confirmNewPasswordError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!validateForm()) {
      setSubmissionError("Please fix the errors above before continuing.");
      return;
    }

    const dataToSubmit = {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
    };

    try {
      const resultAction = await dispatch(changePassword(dataToSubmit)).unwrap();
      onPasswordChangeSuccess(resultAction);
      setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setSubmissionError(err);
    }
  };

  const isPending = loading === true;

  /* ── Eye-toggle button — reusable snippet ── */
  const EyeBtn = ({ visible, onToggle }) => (
    <button
      type="button"
      className="cpf-eye-btn"
      onClick={onToggle}
      aria-label="Toggle password visibility"
    >
      {visible ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
          <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="cpf-form" noValidate>

      {/* Submission / server error banner */}
      {submissionError && (
        <div className="prf-alert prf-alert--error">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {submissionError}
        </div>
      )}

      {/* Current password */}
      <div className="prf-field">
        <label className="prf-label" htmlFor="currentPassword">Current Password</label>
        <div className="cpf-input-wrap">
          <svg className="cpf-input-icon" width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <input
            className={`prf-input cpf-input--has-icons ${currentPasswordError ? 'prf-input--error' : ''}`}
            type={showCurrent ? 'text' : 'password'}
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            onBlur={() => {
              if (!formData.currentPassword) setCurrentPasswordError("Current password is required.");
              else setCurrentPasswordError(null);
            }}
            disabled={isPending}
            placeholder="Enter current password"
            autoComplete="current-password"
          />
          <EyeBtn visible={showCurrent} onToggle={() => setShowCurrent(p => !p)} />
        </div>
        {currentPasswordError && <FieldError msg={currentPasswordError} />}
      </div>

      {/* New password + Confirm — side by side */}
      <div className="prf-field-row">
        <div className="prf-field">
          <label className="prf-label" htmlFor="newPassword">New Password</label>
          <div className="cpf-input-wrap">
            <svg className="cpf-input-icon" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input
              className={`prf-input cpf-input--has-icons ${newPasswordError ? 'prf-input--error' : ''}`}
              type={showNew ? 'text' : 'password'}
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              onBlur={() => {
                const err = handlePasswordValidation(formData.newPassword);
                setNewPasswordError(err);
              }}
              disabled={isPending}
              placeholder="Min 8 characters"
              autoComplete="new-password"
            />
            <EyeBtn visible={showNew} onToggle={() => setShowNew(p => !p)} />
          </div>
          {newPasswordError && <FieldError msg={newPasswordError} />}
        </div>

        <div className="prf-field">
          <label className="prf-label" htmlFor="confirmNewPassword">Confirm New Password</label>
          <div className="cpf-input-wrap">
            <svg className="cpf-input-icon" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            <input
              className={`prf-input cpf-input--has-icons ${confirmNewPasswordError ? 'prf-input--error' : ''}`}
              type={showConfirm ? 'text' : 'password'}
              id="confirmNewPassword"
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              onBlur={() => {
                if (!formData.confirmNewPassword) { setConfirmNewPasswordError("Please confirm your new password."); }
                else if (formData.confirmNewPassword !== formData.newPassword) { setConfirmNewPasswordError("New passwords do not match."); }
                else setConfirmNewPasswordError(null);
              }}
              disabled={isPending}
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
            <EyeBtn visible={showConfirm} onToggle={() => setShowConfirm(p => !p)} />
          </div>
          {confirmNewPasswordError && <FieldError msg={confirmNewPasswordError} />}
        </div>
      </div>

      {/* Submit */}
      <div className="prf-form-actions">
        <button
          type="submit"
          className="prf-btn prf-btn--warning"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <div className="prf-btn-spinner prf-btn-spinner--dark" />
              Updating…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Update Password
            </>
          )}
        </button>
      </div>

    </form>
  );
};

export default ChangePasswordForm;