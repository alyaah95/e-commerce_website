
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, fetchOrderDetails } from '../store/slices/orderSlice'; // 🛑 استيراد الثوانك

// 🛑 بيانات الاتصال الثابتة
const CONTACT_INFO = {
    phone: '+20 123 456 7890',
    facebook: '[https://facebook.com/yourstore](https://facebook.com/yourstore)',
    instagram: '[https://instagram.com/yourstore](https://instagram.com/yourstore)',
    whatsapp: '+20 555 777 9877'
};

const OrderTrackingPage = () => {
    const dispatch = useDispatch();
    const { ordersList, currentOrderDetails, loading, error } = useSelector(state => state.order);

    // 🛑 لتخزين رقم الطلب الذي يتم عرضه تفاصيله حالياً
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    
    // 🛑 للحصول على قائمة الطلبات عند تحميل الصفحة
    useEffect(() => {
        dispatch(fetchAllOrders());
            const listInterval = setInterval(() => {
            dispatch(fetchAllOrders());
            console.log("تم تحديث قائمة الطلبات بالكامل");
        }, 30000);

        return () => clearInterval(listInterval);
    }, [dispatch]);

    // 🛑 لجلب التفاصيل عند اختيار طلب
    useEffect(() => {
        if (selectedOrderId) {
            dispatch(fetchOrderDetails(selectedOrderId));
            const interval = setInterval(() => {
                dispatch(fetchOrderDetails(selectedOrderId)); // جلب البيانات كل 30 ثانية لتحديث الحالة
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [dispatch, selectedOrderId]);


    const handleViewDetails = (orderId) => {
        // إذا كان الطلب نفسه، نخفيه (Toggle)
        if (selectedOrderId === orderId) {
            setSelectedOrderId(null);
        } else {
            setSelectedOrderId(orderId);
        }
    };
    
    // 🛑 دالة مساعدة لتنسيق التاريخ
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };
    
    // 🛑 دالة مساعدة لتحديد لون الحالة
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered':
                return { backgroundColor: '#d4edda', color: '#155724' }; // أخضر
            case 'Out for Delivery':
                return { backgroundColor: '#fff3cd', color: '#856404' }; // برتقالي
            case 'Processing':
                return { backgroundColor: '#cce5ff', color: '#004085' }; // أزرق
            case 'Cancelled':
            case 'Returned':
                return { backgroundColor: '#f8d7da', color: '#721c24' }; // أحمر
            default:
                return { backgroundColor: '#f2f2f2', color: '#333' };
        }
    };

    if (loading === 'pending' && ordersList.length === 0) {
        return <div className="tracking-loading" style={{ textAlign: 'center', marginTop: '50px' }}>Loading orders...</div>;
    }

    if (error && ordersList.length === 0) {
        return <div className="tracking-error" style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>Error loading orders: {error}</div>;
    }

    return (
        <div className="orders-container" style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', color: '#333', borderBottom: '2px solid #ddd', paddingBottom: '10px', marginBottom: '30px' }}>
                تتبع وإدارة الطلبات
            </h2>

            {ordersList.length === 0 ? (
                <p style={{ textAlign: 'center', fontSize: '1.1em', color: '#666' }}>لم تقم بتقديم أي طلبات حتى الآن.</p>
            ) : (
                <div className="orders-list">
                    {ordersList.map((order) => (
                        <div key={order.id} className="order-card" style={{ border: '1px solid #eee', borderRadius: '8px', marginBottom: '20px', padding: '15px', transition: 'all 0.3s', backgroundColor: '#fefefe' }}>
                            <div className="row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="col-4">
                                    <p><strong>رقم الطلب:</strong> <span style={{ color: '#007bff', fontWeight: 'bold' }}>{order.id}</span></p>
                                    <p><strong>تاريخ الطلب:</strong> {formatDate(order.created_at)}</p>
                                </div>
                                <div className="col-4">
                                    <p><strong>الإجمالي:</strong> ${(parseFloat(order.total_amount)+50).toFixed(2)}</p>
                                </div>
                                <div className="col-2" style={{ textAlign: 'center' }}>
                                    <span style={{ padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', ...getStatusStyle(order.status) }}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="col-2" style={{ textAlign: 'right' }}>
                                    <button 
                                        className="btn btn-sm btn-info" 
                                        onClick={() => handleViewDetails(order.id)}
                                        style={{ backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px' }}
                                    >
                                        {selectedOrderId === order.id ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                                    </button>
                                </div>
                            </div>
                            
                            {/* 🛑 تفاصيل الطلب (يتم عرضها عند الاختيار) */}
                            {selectedOrderId === order.id && (
                                <OrderDetailsCard 
                                    details={currentOrderDetails} 
                                    isLoading={loading === 'pending' && currentOrderDetails?.id !== order.id} 
                                    contactInfo={CONTACT_INFO}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {/* 🛑 معلومات التواصل */}
            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #ddd', textAlign: 'center' }}>
                <p style={{ fontSize: '1.1em', fontWeight: 'bold', color: '#555' }}>للاستفسارات حول حالة الطلب، يمكنك التواصل معنا:</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '15px' }}>
                    <span style={{ color: '#007bff', textDecoration: 'none' }}>
                        📞 +20 123 456 7890
                    </span>
                    <span style={{ color: '#25D366', textDecoration: 'none' }}>
                        💬 +20 555 777 9877
                    </span>
                    {/* <a href={CONTACT_INFO.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#1877F2', textDecoration: 'none' }}>
                        🌐 فيسبوك / انستجرام
                    </a> */}
                </div>
            </div>
        </div>
    );
};


// 🛑 مكون فرعي لعرض تفاصيل الطلب (يمكن وضعه في ملف منفصل)
const OrderDetailsCard = ({ details, isLoading, contactInfo }) => {
    
    // 🛑 مراحل تتبع الطلب لإنشاء شريط التقدم
    const orderSteps = [
        { status: 'Processing', label: 'قيد التجهيز', emoji: '📦' },
        { status: 'Out for Delivery', label: 'خارج للتوصيل', emoji: '🚚' },
        { status: 'Delivered', label: 'تم التوصيل', emoji: '✅' },
    ];
    
    // 

    if (isLoading || !details) {
        return <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>... جلب التفاصيل ...</div>;
    }

    const currentStepIndex = orderSteps.findIndex(step => step.status === details.status);
    const isSpecialStatus = details.status === 'Cancelled' || details.status === 'Returned';
    const shippingAddress = details.shipping_address;

    return (
        <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            
            <h3>تفاصيل الطلب:</h3>
            
            {/* 🛑 عرض شريط التقدم */}
            {!isSpecialStatus && (
                <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f0f8ff' }}>
                    <h4>حالة التوصيل</h4>
                    <div className="progress-bar-container" style={{ display: 'flex', justifyContent: 'space-between', margin: '30px 0', position: 'relative' }}>
                        <div className="progress-line" style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '4px', backgroundColor: '#ccc', zIndex: 0 }}></div>
                        <div className="progress-line-filled" style={{ 
                            position: 'absolute', top: '50%', left: '10%', 
                            width: `${(currentStepIndex / (orderSteps.length - 1)) * 80}%`, 
                            height: '4px', backgroundColor: '#28a745', transition: 'width 0.5s', zIndex: 1 
                        }}></div>

                        {orderSteps.map((step, index) => (
                            <div key={step.status} className={`step-dot`} style={{ 
                                zIndex: 2, textAlign: 'center', width: '25%', 
                                fontWeight: index <= currentStepIndex ? 'bold' : 'normal' 
                            }}>
                                <div style={{ 
                                    width: '30px', height: '30px', borderRadius: '50%', margin: '0 auto 10px',
                                    backgroundColor: index <= currentStepIndex ? '#28a745' : '#ccc', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' 
                                }}>
                                    {step.emoji}
                                </div>
                                <span style={{ display: 'block' }}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {isSpecialStatus && (
                <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px', marginBottom: '20px' }}>
                    <p>هذا الطلب **{details.status === 'Cancelled' ? 'ملغي' : 'مرتجع'}**. يرجى مراجعة خدمة العملاء.</p>
                </div>
            )}
            
            {/* 🛑 تفاصيل المنتجات والعنوان */}
            <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* 1. جدول المنتجات */}
                <div className="items-table">
                    <h5>المنتجات في الطلب ({details.items.length})</h5>
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f5f5f5' }}>
                                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>المنتج</th>
                                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>الكمية</th>
                                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>السعر</th>
                            </tr>
                        </thead>
                        <tbody>
                            {details.items.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>{item.title}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{item.quantity}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>${parseFloat(item.price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

    
                {/* 2. عنوان الشحن وتفاصيل الحساب */}
                <div className="shipping-info" style={{ padding: '20px', backgroundColor: '#fdfdfd', border: '1px solid #eee', borderRadius: '8px' }}>
                    <h5 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>تفاصيل الشحن</h5>
                    {shippingAddress ? (
                        <div style={{ fontSize: '0.95em', marginBottom: '20px' }}>
                            <p><strong>الاسم:</strong> {shippingAddress.fullName}</p>
                            <p><strong>الهاتف:</strong> {shippingAddress.phone}</p>
                            <p><strong>المدينة:</strong> {shippingAddress.city}</p>
                            <p style={{ color: '#666' }}><strong>العنوان:</strong> {shippingAddress.details}</p>
                        </div>
                    ) : <p>لا يوجد تفاصيل عنوان.</p>}
                    
                    {/* 🛑 قسم الحسبة الاحترافية (ملخص التكلفة) */}
                    <h5 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginTop: '20px' }}>ملخص التكلفة</h5>
                    <div className="cost-summary" style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span>مجموع المنتجات:</span>
                            <span>${(parseFloat(details.total_amount)).toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', color: '#28a745' }}>
                            <span>رسوم التوصيل:</span>
                            <span>$50.00</span>
                        </div>
                        <hr style={{ margin: '10px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2em', color: '#dc3545' }}>
                            <span>الإجمالي المدفوع:</span>
                            <span>${(parseFloat(details.total_amount) + 50).toFixed(2)}</span>
                        </div>
                    </div>

                    <button 
                        className="btn btn-sm" 
                        style={{ 
                            marginTop: '20px', 
                            width: '100%', 
                            backgroundColor: '#fff', 
                            border: '1px solid #dc3545', 
                            color: '#dc3545',
                            padding: '8px',
                            borderRadius: '5px',
                            fontWeight: 'bold'
                        }} 
                        onClick={() => alert(`لإلغاء أو إرجاع طلب #${details.id}، يرجى التواصل عبر الواتساب: ${contactInfo.whatsapp}`)}
                    >
                        طلب إلغاء أو إرجاع
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;