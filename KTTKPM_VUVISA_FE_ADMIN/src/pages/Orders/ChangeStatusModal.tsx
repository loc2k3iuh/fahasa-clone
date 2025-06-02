import React, { useState } from 'react';

interface ChangeStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedOrderIds: number[];
    onChangeStatus: (status: string) => void;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
    isOpen,
    onClose,
    selectedOrderIds,
    onChangeStatus,
}) => {
    const [selectedStatus, setSelectedStatus] = useState('');

    const statusOptions = [
        { value: 'PENDING', label: 'Chờ xác nhận' },
        { value: 'CONFIRMED', label: 'Đã xác nhận' },
        { value: 'PACKING', label: 'Đang đóng gói' },
        { value: 'DELIVERING', label: 'Đang giao hàng' },
        { value: 'COMPLETED', label: 'Thành công' },
        { value: 'CANCELLED', label: 'Đã hủy' }
    ];

    const handleSubmit = () => {
        if (!selectedStatus) {
            alert('Vui lòng chọn trạng thái');
            return;
        }
        onChangeStatus(selectedStatus);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-10 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-[500px]">
                <h2 className="text-xl font-semibold text-white mb-4">
                    Đổi trạng thái các đơn hàng đã chọn:
                </h2>

                <div className="mb-4">
                    <p className="text-white mb-2">ID đơn hàng: {selectedOrderIds.join(', ')}</p>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full bg-gray-700 text-white rounded-lg p-2 border border-gray-600"
                    >
                        <option value="">- Trạng thái -</option>
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Đổi trạng thái
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeStatusModal;