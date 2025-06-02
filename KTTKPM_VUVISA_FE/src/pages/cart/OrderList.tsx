import React, { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';
import { Link } from 'react-router-dom';
import {
    ClockIcon,
    CheckBadgeIcon,
    CubeIcon,
    TruckIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';

const OrderList: React.FC = () => {
    const [orderPage, setOrderPage] = useState<any>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    console.log("Order page", orderPage);


    useEffect(() => {
        // debugger
        const fetchOrders = async () => {
            try {
                const data = await orderService.getOrdersByUserId(user.id, currentPage, 5);
                setOrderPage(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [user.id, currentPage]);

    const handlePageChange = async (newPage: number) => {
        setIsLoading(true);
        setCurrentPage(newPage);

        try {
            const data = await orderService.getOrdersByUserId(user.id, newPage, 5);
            setOrderPage(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const Pagination = () => {
        const pages = Array.from(Array(orderPage.totalPages).keys());

        return (
            <div className="flex justify-center items-center space-x-3 mt-8">
                <button
                    className={`px-4 py-2 rounded-lg flex items-center transition duration-200 ${currentPage === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Trước
                </button>

                {pages.map(page => (
                    <button
                        key={page}
                        className={`w-10 h-10 rounded-full font-medium transition duration-200 ${currentPage === page
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        onClick={() => handlePageChange(page)}
                    >
                        {page + 1}
                    </button>
                ))}

                <button
                    className={`px-4 py-2 rounded-lg flex items-center transition duration-200 ${currentPage === orderPage.totalPages - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === orderPage.totalPages - 1}
                >
                    Sau
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        );
    };

    const calculateOrderTotal = (order: any) => {
        // Calculate subtotal from order details
        const subtotal = order.order_details.reduce((sum: number, item: any) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Calculate total discount from vouchers
        const totalDiscount = order.vouchers.reduce((sum: number, voucher: any) => {
            if (voucher.discount_amount) {
                return sum + voucher.discount_amount;
            }
            if (voucher.discount_percentage) {
                return sum + (subtotal * voucher.discount_percentage / 100);
            }
            return sum;
        }, 0);

        // Calculate final total
        const total = Math.max(0, subtotal - totalDiscount);

        return total;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';     // Nhẹ nhàng, dễ nhìn
            case 'CONFIRMED':
                return 'bg-blue-100 text-blue-800';
            case 'PACKING':
                return 'bg-purple-100 text-purple-800';
            case 'DELIVERING':
                return 'bg-orange-100 text-orange-800';
            case 'COMPLETED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };


    const getStatusIcon = (status: string) => {
        const iconClass = "h-4 w-4 mr-1";

        switch (status) {
            case 'PENDING':
                return <ClockIcon className={iconClass} />;
            case 'CONFIRMED':
                return <CheckBadgeIcon className={iconClass} />;
            case 'PACKING':
                return <CubeIcon className={iconClass} />;
            case 'DELIVERING':
                return <TruckIcon className={iconClass} />;
            case 'COMPLETED':
                return <CheckCircleIcon className={iconClass} />;
            case 'CANCELLED':
                return <XCircleIcon className={iconClass} />;
            default:
                return null;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xác nhận';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'PACKING':
                return 'Đang đóng gói';
            case 'DELIVERING':
                return 'Đang giao hàng';
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return '';
        }
    };

    const getPaymentMethodIcon = (method: string) => {
        if (method === 'CASH_ON_DELIVERY') {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            );
        } else {
            return (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            );
        }
    };

    const getPaymentMethodText = (method: string) => {
        return method === 'CASH_ON_DELIVERY' ? 'Tiền mặt khi nhận hàng' : 'VNPAY';
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-4 min-h-[60vh] flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4"></div>
                <p className="text-gray-600 font-medium">Đang tải đơn hàng...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 lg:p-6 lg:max-w-6xl">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 mb-8 flex items-center">
                <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Đơn hàng của tôi</h2>
                    <p className="text-gray-600">Quản lý và theo dõi tất cả đơn hàng của bạn tại đây</p>
                </div>
                <div className="hidden md:block">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-400 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
            </div>

            {orderPage.content.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                    <div className="flex justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-gray-800">Bạn chưa có đơn hàng nào</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Hãy khám phá các sản phẩm tuyệt vời của chúng tôi và đặt hàng ngay hôm nay!</p>
                    <Link to="/" className="inline-flex items-center bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Mua sắm ngay
                    </Link>
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {orderPage.content.map((order: any) => (
                            <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition duration-200">
                                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 pb-4 border-b border-gray-100">
                                    <div className="flex items-center mb-3 md:mb-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-gray-800">Đơn hàng #{order.id}</p>
                                            <p className="text-sm text-gray-500">
                                                Ngày đặt: {new Date(order.order_date).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-lg text-sm border flex items-center ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {getStatusText(order.status)}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {order.order_details.map((item: any) => (
                                        <div key={item.product_id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg">
                                            <div className="relative">
                                                <img
                                                    src={item.image_url}
                                                    alt={item.product_name}
                                                    className="w-20 h-24 object-cover rounded-md shadow-sm"
                                                />
                                                <div className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                                    {item.quantity}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-800 mb-1">{item.product_name}</h4>
                                                <p className="text-red-500 font-medium">
                                                    {item.price.toLocaleString()}₫
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 pt-4 border-t border-gray-100">
                                    <div className="flex items-center mb-3 md:mb-0">
                                        {getPaymentMethodIcon(order.payment_method)}
                                        <span className="text-gray-700">
                                            {getPaymentMethodText(order.payment_method)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500 mb-1">Tổng thanh toán</p>
                                        <p className="text-xl font-bold text-red-500">
                                            {calculateOrderTotal(order).toLocaleString()}₫
                                        </p>
                                    </div>
                                </div>

                                {order.status === 'PENDING' && (
                                    <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                                        {/* <button
                                            className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition duration-200 flex items-center"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            Hủy đơn hàng
                                        </button> */}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <Pagination />
                </>
            )}
        </div>
    );
};

export default OrderList;