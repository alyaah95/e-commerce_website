import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile, logout } from '../store/slices/authSlice'; // تأكد من المسار الصحيح
import ChangePasswordForm from '../components/ChangePasswordForm';
import { useNavigate } from 'react-router';

const Profile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // استدعاء الحقول من الـ Redux Store
    const { user, loading, error, isAuthenticated } = useSelector((state) => state.auth);
    const [passwordSuccessMsg, setPasswordSuccessMsg] = useState(null);
    
    // 🛑 حالة جديدة لإدارة وضع التعديل
    const [isEditing, setIsEditing] = useState(false);
    
    // 🛑 حالة نموذج البيانات للتحكم في حقول الإدخال
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        // لا نحتاج حقول الاسم وكلمة المرور ما لم نعدلها
    });
    
    // 🛑 حالة الأخطاء لتطبيق Validation (نسخة معدلة من Register)
    const [emailError, setEmailError] = useState(null);
    const [userNameError, setUserNameError] = useState(null);
    const [submissionError, setSubmissionError] = useState(null);
    
    // 🛑 قواعد الـ Regex (يمكن نقلها إلى ملف ثوابت إذا كانت مشتركة)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // ----------------------------------------------------
    // 1. جلب البيانات عند التحميل الأول
    // ----------------------------------------------------
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        // جلب البيانات إذا لم تكن موجودة في الـ Store
        if (!user && !loading) {
            dispatch(fetchUserProfile());
        }
    }, [dispatch, isAuthenticated, navigate, user, loading]);

    // 🛑 تحديث حالة النموذج عندما يتم جلب بيانات المستخدم بنجاح
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || ''
            });
        }
    }, [user]);

    // ----------------------------------------------------
    // 2. دوال التحقق من الصحة (Validation Handlers)
    // ----------------------------------------------------

    const handleEmailValidation = (email) => {
        if (!email) {
            setEmailError("Email field is required!");
            return "Email field is required!";
        } else if (emailRegex.test(email)) {
            setEmailError(null);
            return null;
        } else {
            setEmailError("Invalid Email format.");
            return "Invalid Email format.";
        }
    };

    const handleUserNameValidation = (username) => {
        if (!username) {
            setUserNameError("User Name is Required");
            return "User Name is Required";
        } else if (/\s/.test(username)) {
            setUserNameError("User Name shouldn't have spaces");
            return "User Name shouldn't have spaces";
        } else {
            setUserNameError(null);
            return null;
        }
    };

    // ----------------------------------------------------
    // 3. دوال التعامل مع الإدخال والإرسال
    // ----------------------------------------------------
    
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
        setSubmissionError(null); // مسح خطأ الإرسال عند تغيير الحقول
    };

    const handleSubmit = async (e) => { 
        e.preventDefault();
        setSubmissionError(null);

        // 🛑 تشغيل الـ Validation عند الإرسال
        const emailValidation = handleEmailValidation(formData.email);
        const userNameValidation = handleUserNameValidation(formData.username);
        
        // التحقق من أن المستخدم قام بتغيير حقل واحد على الأقل 
        const isDataChanged = formData.username !== user.username || formData.email !== user.email;

        if (emailValidation || userNameValidation) {
            setSubmissionError("Please correct the form errors before saving.");
            return;
        }
        
        if (!isDataChanged) {
            setSubmissionError("No changes detected.");
            return;
        }

        // إرسال البيانات
        try {
            await dispatch(updateUserProfile(formData)).unwrap();
            setIsEditing(false); // العودة لوضع القراءة فقط عند النجاح
            setSubmissionError(null);
        } catch (error) {
            // عرض الخطأ القادم من الـ Thunk (مثل: الاسم/الإيميل مستخدم مسبقاً)
            setSubmissionError(`Update failed: ${error}`); 
        }
    };

    const handlePasswordSuccess = (message) => {
        setPasswordSuccessMsg(message);
        // يمكنك إخفاء نموذج التعديل (isEditing) هنا أيضاً إذا أردت
        setIsEditing(false);
    };
    // ----------------------------------------------------
    // 4. عرض الحالة
    // ----------------------------------------------------

    if (loading && !user) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile data...</div>;
    }

    if (error && !user) {
         // إذا كان الخطأ موجوداً ولا يوجد بيانات للمستخدم، فمن المحتمل أن تكون الجلسة منتهية
         return <div style={{ textAlign: 'center', color: 'red', marginTop: '50px' }}>{error} You may need to log in again.</div>;
    }

    if (!user) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}> No data is available.</div>;
    }
    
    // ----------------------------------------------------
    // 5. واجهة العرض والتعديل
    // ----------------------------------------------------
    
    const displayDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'غير متوفر';

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>Profile Page</h2>
            
            {/* رسالة الخطأ العام عند الإرسال */}
            {submissionError && <div style={{ color: "red", border: '1px solid red', padding: '10px', marginBottom: '15px' }}>{submissionError}</div>}
            
            {/* وضع التعديل */}
            {isEditing ? (
                <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <h4>Modify basic personal information</h4>
                    <form onSubmit={handleSubmit}>
                        <p><strong>Current name:</strong> {user.username}</p>
                        
                        <div>
                            <label htmlFor="username"> New user name:</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                onBlur={() => handleUserNameValidation(formData.username)}
                                disabled={loading === 'pending'}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            />
                            {userNameError && <div style={{ color: "red", fontSize: '0.9em' }}>{userNameError}</div>}
                        </div>

                        <div style={{ marginTop: '15px' }}>
                            <label htmlFor="email">New Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={() => handleEmailValidation(formData.email)}
                                disabled={loading === 'pending'}
                                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                            />
                            {emailError && <div style={{ color: "red", fontSize: '0.9em' }}>{emailError}</div>}
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <button type="submit" disabled={loading === 'pending'}>
                                {loading === true ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                    <hr style={{ margin: '30px 0' }} />
                    <h4>Modify password</h4>
                    <ChangePasswordForm onPasswordChangeSuccess={handlePasswordSuccess} />
                    <button type="button" onClick={() => setIsEditing(false)} style={{ marginTop: '20px' }}>
                       Back to profile
                    </button>
                </div>
                
            ) : (
                /* وضع القراءة فقط */
                <div>
                    <p><strong> user name:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Joining date:</strong> {displayDate}</p>
                    
                    <button onClick={() => setIsEditing(true)} style={{ marginTop: '20px' }}>
                       Edit profile
                    </button>
                </div>
            )}
        </div>
    );
};

export default Profile;