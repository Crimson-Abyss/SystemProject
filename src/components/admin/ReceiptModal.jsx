import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaTimes, FaPrint } from 'react-icons/fa';

const ReceiptModal = ({ order, onClose }) => {
    if (!order) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:bg-white print:p-0">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden print:shadow-none print:w-full print:max-w-none">
                {/* Header */}
                <div className="bg-linear-to-r from-pink-500 to-rose-500 p-4 flex justify-between items-center text-white print:hidden">
                    <h2 className="text-xl font-bold">Order Receipt</h2>
                    <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                        <FaTimes />
                    </button>
                </div>

                {/* Receipt Content */}
                <div className="p-6 flex flex-col items-center text-center space-y-4">
                    <div className="text-2xl font-black text-rose-600 tracking-tighter">InsteaG</div>
                    <p className="text-gray-500 text-sm">Thank you for your purchase!</p>

                    <div className="w-full border-t border-b border-dashed border-gray-300 py-4 my-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Order ID:</span>
                            <span className="font-mono font-bold">#{order.id}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                            <span>Date:</span>
                            <span>{new Date().toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-2 text-left">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full flex justify-between items-center text-lg font-bold text-gray-800">
                        <span>Total</span>
                        <span>${order.totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="w-full flex justify-between items-center text-sm text-green-600 font-medium">
                        <span>Points Earned</span>
                        <span>+{order.pointsAwarded} pts</span>
                    </div>

                    {/* QR Code Section */}
                    {order.redemptionCode && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center w-full">
                            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-semibold">Scan to Collect Points</p>
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <QRCodeSVG value={`${window.location.origin}/app/claim/${order.redemptionCode}`} size={150} level="H" />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-2 font-mono">{order.redemptionCode}</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 print:hidden">
                    <button
                        onClick={handlePrint}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-all"
                    >
                        <FaPrint /> Print Receipt
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReceiptModal;
