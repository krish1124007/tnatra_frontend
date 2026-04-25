import React, { useState, useEffect } from 'react';
import { enquiriesAPI } from '../services/api';
import {
    FiPhone,
    FiMapPin,
    FiCalendar,
    FiUsers,
    FiDollarSign,
    FiTag,
    FiClock,
    FiCheckCircle,
    FiAlertCircle,
    FiFilter,
    FiDownload
} from 'react-icons/fi';
import './LoanEnquiries.css';

const LoanEnquiries = () => {
    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchEnquiries();
    }, [filter]);

    const fetchEnquiries = async () => {
        setLoading(true);
        try {
            let response;
            if (filter !== 'all') {
                response = await enquiriesAPI.getEnquiries({ status: filter });
            } else {
                response = await enquiriesAPI.getEnquiries();
            }

            setEnquiries(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching enquiries:', err);
            setError('Failed to load enquiries');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await enquiriesAPI.updateStatus(id, newStatus);
            fetchEnquiries();
            if (selectedEnquiry && selectedEnquiry._id === id) {
                setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
            }
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update status');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            new: 'badge-new',
            in_progress: 'badge-progress',
            completed: 'badge-approved',
            rejected: 'badge-rejected',
        };
        return classes[status] || 'badge-default';
    };

    return (
        <div className="loan-enquiries">
            {/* Filters */}
            <div className="enquiry-filters">
                <button
                    className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
                    onClick={() => setFilter('all')}
                >
                    All Consultations
                </button>
                <button
                    className={filter === 'new' ? 'filter-btn active' : 'filter-btn'}
                    onClick={() => setFilter('new')}
                >
                    New
                </button>
                <button
                    className={filter === 'in_progress' ? 'filter-btn active' : 'filter-btn'}
                    onClick={() => setFilter('in_progress')}
                >
                    In Progress
                </button>
                <button
                    className={filter === 'completed' ? 'filter-btn active' : 'filter-btn'}
                    onClick={() => setFilter('completed')}
                >
                    Completed
                </button>
            </div>

            {/* Enquiries List */}
            <div className="enquiries-container">
                {loading ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>Loading consultations...</p>
                    </div>
                ) : error ? (
                    <div className="error-message">
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                ) : enquiries.length === 0 ? (
                    <div className="empty-state">
                        <FiFilter />
                        <h3>No consultations found</h3>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="enquiries-table">
                            <thead>
                                <tr>
                                    <th>Client Name</th>
                                    <th>Phone Number</th>
                                    <th>Birth Date</th>
                                    <th>Birth Time</th>
                                    <th>Birth Place</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enquiries.map((enquiry) => (
                                    <tr key={enquiry._id} onClick={() => setSelectedEnquiry(enquiry)}>
                                        <td>{enquiry.clientName || 'Anonymous'}</td>
                                        <td>{enquiry.phoneNumber}</td>
                                        <td>{enquiry.birthDate || '-'}</td>
                                        <td>{enquiry.birthTime || '-'}</td>
                                        <td>{enquiry.birthPlace || '-'}</td>
                                        <td>{formatDate(enquiry.createdAt)}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusBadgeClass(enquiry.status)}`}>
                                                {enquiry.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="view-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedEnquiry(enquiry);
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detailed View Modal */}
            {selectedEnquiry && (
                <div className="modal-overlay" onClick={() => setSelectedEnquiry(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Consultation Details</h2>
                            <button className="close-btn" onClick={() => setSelectedEnquiry(null)}>×</button>
                        </div>

                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>User Information</h3>
                                <p><strong>Name:</strong> {selectedEnquiry.clientName || 'Not provided'}</p>
                                <p><strong>Phone:</strong> {selectedEnquiry.phoneNumber}</p>
                                <p><strong>Birth Date:</strong> {selectedEnquiry.birthDate || 'Not provided'}</p>
                                <p><strong>Birth Time:</strong> {selectedEnquiry.birthTime || 'Not provided'}</p>
                                <p><strong>Birth Place:</strong> {selectedEnquiry.birthPlace || 'Not provided'}</p>
                            </div>

                            <div className="detail-section">
                                <h3>Problem Description</h3>
                                <p>{selectedEnquiry.problem || 'No problem described'}</p>
                            </div>

                            <div className="detail-section">
                                <h3>Update Status</h3>
                                <div className="status-buttons">
                                    <button onClick={() => updateStatus(selectedEnquiry._id, 'new')}>New</button>
                                    <button onClick={() => updateStatus(selectedEnquiry._id, 'in_progress')}>In Progress</button>
                                    <button onClick={() => updateStatus(selectedEnquiry._id, 'completed')}>Completed</button>
                                    <button onClick={() => updateStatus(selectedEnquiry._id, 'rejected')}>Rejected</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default LoanEnquiries;