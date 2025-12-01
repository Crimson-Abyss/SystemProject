import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { useUser } from './UserContext';


const ClaimPoints = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const { refreshUser } = useUser();
    const [status, setStatus] = useState('processing'); // processing, success, error
    const [message, setMessage] = useState('Verifying code...');

    const attemptRef = React.useRef(false);

    useEffect(() => {
        const claimPoints = async () => {
            if (attemptRef.current) return;
            attemptRef.current = true;

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch('/api/claim-points', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ redemptionCode: code })
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message);
                    refreshUser(); 
                    setTimeout(() => navigate('/app'), 3000);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Failed to claim points');
                }
            } catch (error) {
                console.error('Error claiming points:', error);
                setStatus('error');
                setMessage('An error occurred while processing your request.');
            }
        };

        if (code) {
            claimPoints();
        }
    }, [code, navigate, refreshUser]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
                {status === 'processing' && (
                    <>
                        <FaSpinner className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Processing...</h2>
                        <p className="text-gray-500 dark:text-gray-400">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <FaCheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Success!</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                        <button 
                            onClick={() => navigate('/app')}
                            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <FaTimesCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Error</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                        <button 
                            onClick={() => navigate('/app')}
                            className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Go Back
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ClaimPoints;
