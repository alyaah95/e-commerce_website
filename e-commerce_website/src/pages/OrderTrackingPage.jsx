import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, fetchOrderDetails } from '../store/slices/orderSlice';
import './OrderTrackingPage.css';

const CONTACT_INFO = {
    // phone: '+20 123 456 7890',
    facebook: 'https://facebook.com/yourstore',
    instagram: 'https://instagram.com/yourstore',
    // whatsapp: '+20 555 777 9877'
};

/* ── Status config helper ────────────────────────────────────── */
const getStatusConfig = (status) => {
    switch (status) {
        case 'Delivered':
            return { bg: '#d1fae5', color: '#065f46', accent: '#198754', label: 'Delivered', icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            )};
        case 'Out for Delivery':
            return { bg: '#fff7ed', color: '#9a3412', accent: '#f97316', label: 'Out for Delivery', icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            )};
        case 'Processing':
            return { bg: '#eff6ff', color: '#1e40af', accent: '#3b82f6', label: 'Processing', icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
            )};
        case 'Cancelled':
            return { bg: '#fef2f2', color: '#991b1b', accent: '#ef4444', label: 'Cancelled', icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            )};
        case 'Returned':
            return { bg: '#fffbeb', color: '#92400e', accent: '#d97706', label: 'Returned', icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
            )};
        default:
            return { bg: '#f3f4f6', color: '#374151', accent: '#9ca3af', label: status, icon: '•' };
    }
};

/* ── Page Component ──────────────────────────────────────────── */
const OrderTrackingPage = () => {
    const dispatch = useDispatch();
    const { ordersList, currentOrderDetails, loading, error } = useSelector(state => state.order);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    useEffect(() => {
        dispatch(fetchAllOrders());
        const listInterval = setInterval(() => {
            dispatch(fetchAllOrders());
            console.log("Order list refreshed");
        }, 360000);
        return () => clearInterval(listInterval);
    }, [dispatch]);

    useEffect(() => {
        if (selectedOrderId) {
            dispatch(fetchOrderDetails(selectedOrderId));
            const interval = setInterval(() => {
                dispatch(fetchOrderDetails(selectedOrderId));
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [dispatch, selectedOrderId]);

    const handleViewDetails = (orderId) => {
        if (selectedOrderId === orderId) {
            setSelectedOrderId(null);
        } else {
            setSelectedOrderId(orderId);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    /* ── Derived stats (presentation only, computed from existing data) ── */
    const totalOrders    = ordersList.length;
    const inProgress     = ordersList.filter(o => o.status === 'Processing' || o.status === 'Out for Delivery').length;
    const completed      = ordersList.filter(o => o.status === 'Delivered').length;

    /* ── Loading ── */
    if (loading === 'pending' && ordersList.length === 0) {
        return (
            <div className="otp-fullscreen-center">
                <div className="otp-spinner" />
                <p className="otp-loading-text">Loading your orders…</p>
            </div>
        );
    }

    /* ── Error ── */
    if (error && ordersList.length === 0) {
        return (
            <div className="otp-fullscreen-center">
                <div className="otp-error-card">
                    <span className="otp-error-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </span>
                    <h5>Something went wrong</h5>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="otp-page">
            <div className="otp-container">

                {/* ══════════════════════════════════════
                    HERO HEADER
                ══════════════════════════════════════ */}
                <div className="otp-hero">
                    <div className="otp-hero-text">
                        <h1 className="otp-hero-title">My Orders</h1>
                        <p className="otp-hero-sub">Track, manage and review all your purchases</p>
                    </div>

                    {/* Summary Stat Cards — only shown when there are orders */}
                    {ordersList.length > 0 && (
                        <div className="otp-stats">
                            <div className="otp-stat-card">
                                <div className="otp-stat-icon otp-stat-icon--total">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                                </div>
                                <div>
                                    <span className="otp-stat-value">{totalOrders}</span>
                                    <span className="otp-stat-label">Total Orders</span>
                                </div>
                            </div>
                            <div className="otp-stat-card">
                                <div className="otp-stat-icon otp-stat-icon--progress">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                </div>
                                <div>
                                    <span className="otp-stat-value">{inProgress}</span>
                                    <span className="otp-stat-label">In Progress</span>
                                </div>
                            </div>
                            <div className="otp-stat-card">
                                <div className="otp-stat-icon otp-stat-icon--done">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                <div>
                                    <span className="otp-stat-value">{completed}</span>
                                    <span className="otp-stat-label">Completed</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ══════════════════════════════════════
                    EMPTY STATE
                ══════════════════════════════════════ */}
                {ordersList.length === 0 ? (
                    <div className="otp-empty-state">
                        <div className="otp-empty-icon">
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                        </div>
                        <h5>No orders yet</h5>
                        <p>When you place an order, it will appear here.</p>
                    </div>
                ) : (

                /* ══════════════════════════════════════
                    ORDER LIST
                ══════════════════════════════════════ */
                    <div className="otp-list">
                        {ordersList.map((order) => {
                            const cfg   = getStatusConfig(order.status);
                            const isOpen = selectedOrderId === order.id;

                            /* Thumbnail: first image from order items if available */
                            const firstImg  = order.items?.[0]?.image || order.items?.[0]?.images?.[0] || null;
                            const extraCount = (order.items?.length || 0) - 1;

                            return (
                                <div key={order.id} className={`otp-card ${isOpen ? 'otp-card--open' : ''}`}>

                                    {/* ── Card Summary (clickable) ── */}
                                    <button
                                        className="otp-card-summary"
                                        onClick={() => handleViewDetails(order.id)}
                                        aria-expanded={isOpen}
                                    >
                                        {/* LEFT — Thumbnail + Info */}
                                        <div className="otp-card-left">
                                            <div className="otp-thumb-wrap">
                                                {firstImg ? (
                                                    <img src={firstImg} alt="product" className="otp-thumb" />
                                                ) : (
                                                    <div className="otp-thumb-placeholder">
                                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
                                                    </div>
                                                )}
                                                {extraCount > 0 && (
                                                    <span className="otp-thumb-more">+{extraCount}</span>
                                                )}
                                            </div>
                                            <div className="otp-card-info">
                                                <span className="otp-order-id">Order #{order.id}</span>
                                                <span className="otp-order-date">{formatDate(order.created_at)}</span>
                                                <span className="otp-item-count">
                                                    {order.items?.length
                                                        ? `${order.items.length} item${order.items.length !== 1 ? 's' : ''}`
                                                        : 'View details'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* RIGHT — Price + Status + Chevron */}
                                        <div className="otp-card-right">
                                            <span className="otp-price">${(parseFloat(order.total_amount) + 50).toFixed(2)}</span>
                                            <span
                                                className="otp-status-badge"
                                                style={{ background: cfg.bg, color: cfg.color }}
                                            >
                                                <span className="otp-status-icon" style={{ color: cfg.accent }}>
                                                    {cfg.icon}
                                                </span>
                                                {cfg.label}
                                            </span>
                                            <span className={`otp-chevron ${isOpen ? 'otp-chevron--up' : ''}`}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="6 9 12 15 18 9"/>
                                                </svg>
                                            </span>
                                        </div>
                                    </button>

                                    {/* ── Expanded Details ── */}
                                    {isOpen && (
                                        <div className="otp-card-body">
                                            <OrderDetailsCard
                                                details={currentOrderDetails}
                                                isLoading={loading === 'pending' && currentOrderDetails?.id !== order.id}
                                                contactInfo={CONTACT_INFO}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ══════════════════════════════════════
                    HELP BAR
                ══════════════════════════════════════ */}
                <div className="otp-help-bar">
                    <div className="otp-help-inner">
                        <div className="otp-help-text">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                            <span>Need help with an order?</span>
                        </div>
                        <div className="otp-help-actions">
                            <a href={ CONTACT_INFO.phone? `tel:${CONTACT_INFO.phone}` : `#`} className="otp-help-btn otp-help-btn--phone">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.9 11.63 19.79 19.79 0 01.86 3 2 2 0 012.86 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.91a16 16 0 006 6l1.08-1.08a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                                Call Us
                            </a>
                            <a href={CONTACT_INFO.whatsapp? `https://wa.me/${CONTACT_INFO.whatsapp.replace(/\s/g,'')}` : `#`} className="otp-help-btn otp-help-btn--whatsapp" target="_blank" rel="noopener noreferrer">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                WhatsApp
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};


/* ═══════════════════════════════════════════════════════════════
   InvoiceModal
   ─ Rendered via ReactDOM.createPortal directly into document.body
     so it escapes every stacking context (overflow:hidden, z-index,
     transform) that would break the @media print rescue rules.
   ─ window.print() fires on the live page; @media print makes
     everything invisible except .inv-printable.
   ─ No window.open(), no blank tabs, no stray windows ever.
═══════════════════════════════════════════════════════════════ */
const InvoiceModal = ({ details, onClose }) => {
    const shippingAddress = details.shipping_address;
    const printDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const handlePrint = () => window.print();

    /* Close on backdrop click */
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    /* Close on Escape key */
    React.useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose]);

    /* Lock body scroll while open; restore on close */
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    /* ── Portal render: mounts directly on document.body ────────
       This escapes every ancestor's overflow/transform/z-index
       stacking context, which is the root cause of @media print
       rescue rules silently failing in Chrome/Safari/Edge.
    ─────────────────────────────────────────────────────────── */
    return ReactDOM.createPortal(
        <div className="inv-backdrop" onClick={handleBackdropClick}>
            <div className="inv-modal" role="dialog" aria-modal="true" aria-label={`Invoice for Order #${details.id}`}>

                {/* ── Modal toolbar (hidden when printing) ── */}
                <div className="inv-toolbar inv-no-print">
                    <div className="inv-toolbar-left">
                        <div className="inv-toolbar-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <span>Invoice — Order #{details.id}</span>
                    </div>
                    <div className="inv-toolbar-actions">
                        <button className="inv-btn inv-btn--print" onClick={handlePrint}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                            Print
                        </button>
                        <button className="inv-btn inv-btn--close" onClick={onClose} aria-label="Close invoice">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            Close
                        </button>
                    </div>
                </div>

                {/* ── Printable receipt area ── */}
                <div className="inv-printable">

                    {/* Header */}
                    <div className="inv-header">
                        <div className="inv-brand">
                            <span className="inv-brand-name">MyCart Bliss</span>
                            <span className="inv-brand-url">mycartbliss.com</span>
                        </div>
                        <div className="inv-meta">
                            <span className="inv-meta-title">INVOICE</span>
                            <span className="inv-meta-detail">Order #{details.id}</span>
                            <span className="inv-meta-detail">Issued: {printDate}</span>
                        </div>
                    </div>

                    {/* Info columns */}
                    <div className="inv-info-cols">
                        <div className="inv-info-col">
                            <span className="inv-col-label">Ship To</span>
                            {shippingAddress ? (
                                <div className="inv-address">
                                    <strong>{shippingAddress.fullName}</strong>
                                    <span>{shippingAddress.city}</span>
                                    <span>{shippingAddress.details}</span>
                                    <span>{shippingAddress.phone}</span>
                                </div>
                            ) : (
                                <span className="inv-muted">No address on file.</span>
                            )}
                        </div>
                        <div className="inv-info-col inv-info-col--right">
                            <span className="inv-col-label">Order Info</span>
                            <div className="inv-order-info">
                                <div className="inv-info-row">
                                    <span>Order ID</span>
                                    <strong>#{details.id}</strong>
                                </div>
                                <div className="inv-info-row">
                                    <span>Status</span>
                                    <span className="inv-status-chip">{details.status}</span>
                                </div>
                                <div className="inv-info-row">
                                    <span>Date</span>
                                    <strong>{printDate}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items table */}
                    <div className="inv-table-wrap">
                        <table className="inv-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th className="inv-tc">Qty</th>
                                    <th className="inv-tr">Unit Price</th>
                                    <th className="inv-tr">Line Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {details.items.map((item, i) => (
                                    <tr key={i}>
                                        <td>{item.title}</td>
                                        <td className="inv-tc">{item.quantity}</td>
                                        <td className="inv-tr">${parseFloat(item.price).toFixed(2)}</td>
                                        <td className="inv-tr">${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="inv-totals">
                        <div className="inv-tot-row">
                            <span>Subtotal</span>
                            <span>${parseFloat(details.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="inv-tot-row">
                            <span>Shipping</span>
                            <span>$50.00</span>
                        </div>
                        <div className="inv-tot-divider" />
                        <div className="inv-tot-row inv-tot-row--grand">
                            <span>Total Paid</span>
                            <span>${(parseFloat(details.total_amount) + 50).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="inv-footer">
                        Thank you for shopping with MyCart Bliss &nbsp;·&nbsp; Support: {CONTACT_INFO.phone}
                    </div>

                </div>
            </div>
        </div>,
        document.body
    );
};


/* ═══════════════════════════════════════════════════════════════
   OrderDetailsCard — logic untouched
═══════════════════════════════════════════════════════════════ */
const OrderDetailsCard = ({ details, isLoading, contactInfo }) => {

    const [showInvoice, setShowInvoice] = useState(false);

    const orderSteps = [
        {
            status: 'Processing',
            label: 'Order Placed',
            sublabel: 'We\'ve received your order',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
            )
        },
        {
            status: 'Out for Delivery',
            label: 'Out for Delivery',
            sublabel: 'Your order is on the way',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            )
        },
        {
            status: 'Delivered',
            label: 'Delivered',
            sublabel: 'Your order has arrived',
            icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            )
        },
    ];

    if (isLoading || !details) {
        return (
            <div className="otp-details-loading">
                <div className="otp-spinner otp-spinner--sm" />
                <span>Fetching order details…</span>
            </div>
        );
    }

    const currentStepIndex = orderSteps.findIndex(s => s.status === details.status);
    const isSpecialStatus   = details.status === 'Cancelled' || details.status === 'Returned';
    const shippingAddress   = details.shipping_address;
    const isDelivered       = details.status === 'Delivered';

    return (
        <>
        {/* ── Invoice Modal (portal-style, rendered above everything) ── */}
        {showInvoice && (
            <InvoiceModal
                details={details}
                onClose={() => setShowInvoice(false)}
            />
        )}

        <div className="otp-details">

            {/* ── Vertical Stepper ── */}
            {!isSpecialStatus && (
                <div className="otp-stepper-wrap">
                    <p className="otp-eyebrow">Delivery Progress</p>
                    <div className="otp-stepper">
                        {orderSteps.map((step, index) => {
                            const done   = index < currentStepIndex;
                            const active = index === currentStepIndex;
                            const future = index > currentStepIndex;
                            return (
                                <div key={step.status} className={`otp-stepper-step ${done ? 'done' : ''} ${active ? 'active' : ''} ${future ? 'future' : ''}`}>
                                    {index < orderSteps.length - 1 && (
                                        <div className={`otp-stepper-line ${done || active ? 'filled' : ''}`} />
                                    )}
                                    <div className="otp-stepper-dot">
                                        {done ? (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        ) : (
                                            step.icon
                                        )}
                                        {active && <span className="otp-pulse" />}
                                    </div>
                                    <div className="otp-stepper-text">
                                        <span className="otp-stepper-label">{step.label}</span>
                                        <span className="otp-stepper-sub">{step.sublabel}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Cancelled / Returned banner ── */}
            {isSpecialStatus && (
                <div className="otp-alert">
                    <div className="otp-alert-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <div>
                        <strong>Order {details.status}</strong>
                        <p>Please contact customer support for assistance with this order.</p>
                    </div>
                </div>
            )}

            {/* ── Body: Items + Summary ── */}
            <div className="otp-body-grid">

                {/* Mini Product Cards */}
                <div className="otp-products-col">
                    <p className="otp-eyebrow">Items in this order</p>
                    <div className="otp-product-list">
                        {details.items.map((item, index) => {
                            const imgSrc = item.image || item.images?.[0] || null;
                            return (
                                <div key={index} className="otp-product-row">
                                    <div className="otp-product-img-wrap">
                                        {imgSrc ? (
                                            <img src={imgSrc} alt={item.title} className="otp-product-img" />
                                        ) : (
                                            <div className="otp-product-img-placeholder">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="otp-product-info">
                                        <span className="otp-product-name">{item.title}</span>
                                        <span className="otp-product-qty">Qty: {item.quantity}</span>
                                    </div>
                                    <span className="otp-product-price">${parseFloat(item.price).toFixed(2)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Shipping + Receipt */}
                <div className="otp-summary-col">

                    {shippingAddress && (
                        <div className="otp-address-card">
                            <div className="otp-address-header">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                Shipping To
                            </div>
                            <strong>{shippingAddress.fullName}</strong>
                            <span>{shippingAddress.city}</span>
                            <span>{shippingAddress.details}</span>
                            <span>{shippingAddress.phone}</span>
                        </div>
                    )}

                    <div className="otp-receipt">
                        <div className="otp-receipt-row">
                            <span>Subtotal</span>
                            <span>${parseFloat(details.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="otp-receipt-row otp-receipt-row--ship">
                            <span>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                                Shipping
                            </span>
                            <span>$50.00</span>
                        </div>
                        <div className="otp-receipt-divider" />
                        <div className="otp-receipt-row otp-receipt-row--total">
                            <span>Total Paid</span>
                            <span>${(parseFloat(details.total_amount) + 50).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="otp-actions">
                        {/* ── Invoice button now opens the in-page modal ── */}
                        <button
                            className="otp-btn otp-btn--invoice"
                            onClick={() => setShowInvoice(true)}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Download Invoice
                        </button>
                        {/* {isDelivered && (
                            <button
                                className="otp-btn otp-btn--reorder"
                                onClick={() => alert(`Reorder for order #${details.id} coming soon!`)}
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                                Buy Again
                            </button>
                        )} */}
                        {!isDelivered && (
                            <button
                            className="otp-btn otp-btn--cancel"
                            onClick={() => alert(`To cancel or return this order, please contact us via WhatsApp: ${contactInfo.whatsapp || '+1234567890'}`)}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                            Cancel / Return
                        </button>)}
                        
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default OrderTrackingPage;