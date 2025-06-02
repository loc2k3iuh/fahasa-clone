import { ArrowLeftRight, Banknote, Check, FileDown, FileUp, NotebookPen, Truck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { orderService } from "../../services/orderService";
import { Order, OrderFilter, OrderStatus } from "../../types/order";
import { useQuery } from "@tanstack/react-query";
import ChangeStatusModal from "./ChangeStatusModal";
import { toast } from "sonner";
import { href } from "react-router-dom";

const ListOrder: React.FC = () => {
  useEffect(() => {
    document.title = "Order List";
  }, []);

  const statusStyles = {
    PENDING: "bg-yellow-900 text-yellow-400",
    CONFIRMED: "bg-blue-900 text-blue-400",
    PACKING: "bg-purple-900 text-purple-400",
    DELIVERING: "bg-orange-900 text-orange-400",
    COMPLETED: "bg-green-900 text-green-400",
    CANCELLED: "bg-red-900 text-red-400"
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // Đổi thành 0 vì API bắt đầu từ 0
  const [pageSize, setPageSize] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  // lọc các thuộc tính của order
  const handleFilter = async (resetPage = false) => {
    setIsLoading(true);
    try {
      if (resetPage) setCurrentPage(0); // Reset về trang đầu nếu cần
      const filter: OrderFilter = {
        order_id: searchId ? Number(searchId) : null,
        status: selectedStatus.length > 0 ? selectedStatus : null,
        full_name: null,
        phone_number: searchCustomer || null,
        product_name: searchProduct || null,
        shipping_method: selectedShipping.length > 0 ? selectedShipping : null,
        start_date: startDate || null,
        end_date: endDate || null,
      };

      const response = await orderService.filterOrders(
        filter,
        resetPage ? 0 : currentPage,
        pageSize
      );
      setOrders(response.result.content);
      setTotalPages(response.result.totalPages);
      setTotalElements(response.result.totalElements);
    } catch (error) {
      setOrders([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi hàm fetchOrders mỗi khi currentPage hoặc pageSize thay đổi
  useEffect(() => {
    handleFilter();
    console.log(currentPage);
  }, [currentPage, pageSize]);


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  // chọn tất cả đơn hàng
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  // kiểm tra xem tất cả đơn hàng đã được chọn hay chưa
  const isAllSelected = orders.length > 0 && orders.every(order => selectedOrderIds.includes(order.id));
  // chọn một đơn hàng
  const handleSelectOne = (id: number) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };
  // chọn tất cả đơn hàng
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrderIds(selectedOrderIds.filter(id => !orders.some(order => order.id === id)));
    } else {
      const newIds = orders
        .map(order => order.id)
        .filter(id => !selectedOrderIds.includes(id));
      setSelectedOrderIds([...selectedOrderIds, ...newIds]);
    }
  };

  // đầu tiên, thêm các trạng thái này ở đầu component 
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  // các trạng thái đơn hàng
  const statusOptions = [
    { value: 'PENDING', label: 'Chờ xác nhận' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'PACKING', label: 'Đang đóng gói' },
    { value: 'DELIVERING', label: 'Đang giao hàng' },
    { value: 'COMPLETED', label: 'Thành công' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];
  // kiểm tra xem tất cả trạng thái đã được chọn hay chưa
  const isAllSelectedStatus = statusOptions.length > 0 && statusOptions.every(status => selectedStatus.includes(status.value));
  // Thêm state mới
  const [searchStatusTerm, setSearchStatusTerm] = useState('');
  // Lọc statusOptions dựa trên searchStatusTerm
  const filteredStatusOptions = statusOptions.filter(option =>
    option.label.toLowerCase().includes(searchStatusTerm.toLowerCase())
  );
  // chọn tất cả trang thái
  const handleSelectAllStatus = () => {
    if (isAllSelectedStatus) {
      setSelectedStatus(selectedStatus.filter(value => !statusOptions.some(status => status.value === value)));
    } else {
      const newStatus = statusOptions
        .map(status => status.value)
        .filter(value => !selectedStatus.includes(value));
      setSelectedStatus([...selectedStatus, ...newStatus]);
    }
  };

  // Thêm các state mới ở đầu component
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState<string[]>([]);
  const [searchShippingTerm, setSearchShippingTerm] = useState('');

  // Thêm options cho hãng vận chuyển
  const shippingOptions = [
    { value: 'STANDARD', label: 'Giao hàng tiêu chuẩn' },
    // { value: 'GHTK', label: 'Giao hàng tiết kiệm' },
    // { value: 'GHN', label: 'Giao hàng nhanh' },
    // { value: 'NINJA_VAN', label: 'Ninja Van' },
    // { value: 'VIETTEL_POST', label: 'Viettel Post' },
    // { value: 'GRAB_EXPRESS', label: 'Grab Express' },
  ];

  // Kiểm tra tất cả đã được chọn chưa
  const isAllSelectedShipping = shippingOptions.length > 0 && shippingOptions.every(shipping =>
    selectedShipping.includes(shipping.value)
  );

  // Lọc shippingOptions dựa trên searchShippingTerm
  const filteredShippingOptions = shippingOptions.filter(option =>
    option.label.toLowerCase().includes(searchShippingTerm.toLowerCase())
  );

  // Thêm handler cho việc chọn tất cả
  const handleSelectAllShipping = () => {
    if (isAllSelectedShipping) {
      setSelectedShipping([]);
    } else {
      setSelectedShipping(shippingOptions.map(option => option.value));
    }
  };

  // Thêm states cho date range
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Thêm useEffect để set giá trị mặc định khi component mount
  useEffect(() => {
    // Lấy ngày hiện tại
    const today = new Date();

    // Tạo ngày sau 2 tháng
    const twoMonthsLater = new Date();
    twoMonthsLater.setMonth(today.getMonth() + 2);

    // Format dates to YYYY-MM-DD
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    setStartDate(formatDate(today));
    setEndDate(formatDate(twoMonthsLater));
  }, []);

  // Thêm state để quản lý trạng thái dropdown
  const [isAddNewOpen, setIsAddNewOpen] = useState(false);
  // Thêm các handlers cho các action
  const handleAddNew = () => {
    // Xử lý thêm mới
    setIsAddNewOpen(false);
  };
  const handleImportExcel = () => {
    // Xử lý nhập từ excel
    setIsAddNewOpen(false);
  };
  const handleImportStatus = () => {
    // Xử lý nhập trạng thái từ excel
    setIsAddNewOpen(false);
  };

  // Thêm state để quản lý trạng thái dropdown thao tác
  const [isActionOpen, setIsActionOpen] = useState(false);
  // Thêm các handlers cho các action
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false);

  const handleChangeStatus = () => {
    if (selectedOrderIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn hàng!");
      return;
    }
    setIsActionOpen(false);
    setIsChangeStatusModalOpen(true);
  };

  const handleStatusChange = async (status: string) => {
    setIsLoading(true);
    try {
      const updateStatus = {
        orderIds: selectedOrderIds,
        status: status
      }
      await orderService.updateOrdersStatus(updateStatus);
      // Refresh lại danh sách sau khi cập nhật
      handleFilter();
      setSelectedOrderIds([]);
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái đơn hàng!");
    } finally {
      // setIsLoading(false);
    }
  };
  const handleExportExcel = () => {
    setIsActionOpen(false);
  };
  const handleDeleteOrders = async () => {
    if (selectedOrderIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn hàng để xóa!");
      return;
    }

    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa các đơn hàng đã chọn không?");
    if (!confirmDelete) {
      return;
    }
    setIsLoading(true);
    try {
      await orderService.deleteOrders(selectedOrderIds);
      toast.success("Đã xóa các đơn hàng đã chọn!");
      handleFilter();
    } catch (error) {
      toast.error("Không thể xóa các đơn hàng đã chọn!");
    } finally {
      setIsLoading(false);
    }

    setIsActionOpen(false);
  };

  const handleDeleteOrder = async (orderId: number) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này không?");
    if (!confirmDelete) {
      return;
    }
    setIsLoading(true);
    try {
      await orderService.deleteOrders([orderId]);
      toast.success("Đã xóa đơn hàng!");
      handleFilter();
    } catch (error) {
      toast.error("Không thể xóa đơn hàng!");
    } finally {
      setIsLoading(false);
    }
  }

  // Thêm state để quản lý trạng thái dropdown in đơn
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  // Thêm các handlers cho các action in
  const handlePrintA4A5 = async () => {
    setIsPrintOpen(false);
    if (selectedOrderIds.length === 0) {
      toast.error("Vui lòng chọn ít nhất một đơn hàng để in!");
      return;
    }
    try {
      const toastId = toast.loading("Đang tạo file PDF...");
      const response = await orderService.generateOrderPdfUrl(selectedOrderIds);
      if (response?.result) {
        const link = document.createElement("a");
        link.href = response.result;
        link.setAttribute("target", "_blank");
        link.setAttribute("download", "");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("File PDF đã được tạo thành công!", { id: toastId });
        handleFilter();
      } else {
        toast.error("Không thể tạo file PDF!", { id: toastId });
      }
    } catch (error) {
      toast.error("Không thể tạo file PDF!");
    } finally {
      setSelectedOrderIds([]);
    }
  };

  const [activeMenuOrderId, setActiveMenuOrderId] = useState<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const statusDropdown = document.querySelector('.status-dropdown');
      const shippingDropdown = document.querySelector('.shipping-dropdown');
      const dropdown = document.querySelector('.add-new-dropdown');
      const actionDropdown = document.querySelector('.action-dropdown');
      const printDropdown = document.querySelector('.print-dropdown');
      const menuDropdowns = document.querySelectorAll('.menu-dropdown');
      let clickedInside = false;
      menuDropdowns.forEach(dropdown => {
        if (dropdown.contains(event.target as Node)) {
          clickedInside = true;
        }
      });

      if (!clickedInside) {
        setActiveMenuOrderId(null);
      }

      if (isStatusOpen && statusDropdown && !statusDropdown.contains(event.target as Node)) {
        setIsStatusOpen(false);
        setSearchStatusTerm('');
      }
      if (isShippingOpen && shippingDropdown && !shippingDropdown.contains(event.target as Node)) {
        setIsShippingOpen(false);
        setSearchShippingTerm('');
      }
      if (isAddNewOpen && dropdown && !dropdown.contains(event.target as Node)) {
        setIsAddNewOpen(false);
      }
      if (isActionOpen && actionDropdown && !actionDropdown.contains(event.target as Node)) {
        setIsActionOpen(false);
      }
      if (isPrintOpen && printDropdown && !printDropdown.contains(event.target as Node)) {
        setIsPrintOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isStatusOpen, isShippingOpen, isAddNewOpen, isActionOpen, isPrintOpen]);

  console.log("orders", orders);


  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-15">
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white/90">Orders</h2>
            <nav>
              <ol className="flex items-center gap-1.5">
                <li>
                  <a
                    className="inline-flex items-center gap-1.5 text-[0.875rem] text-white"
                    href="/admin"
                  >
                    Home
                    <svg
                      className="stroke-current"
                      width="17"
                      height="16"
                      viewBox="0 0 17 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </a>
                </li>
                <li className="text-[0.875rem] text-white/90">Orders</li>
              </ol>
            </nav>
          </div>
        </div>
        <div>
          {/* Filter section */}
          <div className="flex flex-wrap gap-4 mb-6">
            {/* tìm kiếm theo id của đơn hàng */}
            <input
              type="text"
              placeholder="ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            />
            {/* tìm kiếm theo trạng thái đơn hàng */}
            <div className="relative status-dropdown">
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="bg-gray-800 text-gray-50 px-4 py-2 rounded-lg border border-gray-700 w-[200px] text-left flex justify-between items-center"
              >
                <span className="text-gray-50" >{selectedStatus.length > 0 ? `${selectedStatus.length} đã chọn` : 'Trạng thái'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isStatusOpen && (
                <div className="absolute z-10 mt-1 w-[300px] bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                  <div className="p-2 flex items-center gap-2 bg-gray-800 border-b border-gray-700">
                    <input
                      type="checkbox"
                      checked={isAllSelectedStatus}
                      onChange={handleSelectAllStatus}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      value={searchStatusTerm}
                      onChange={(e) => setSearchStatusTerm(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none"
                    />
                  </div>
                  <div className="max-h-60 overflow-auto">
                    {filteredStatusOptions.map((option) => (
                      <label key={option.value} className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-2"
                          checked={selectedStatus.includes(option.value)}
                          onChange={() => {
                            if (selectedStatus.includes(option.value)) {
                              setSelectedStatus(selectedStatus.filter(status => status !== option.value));
                            } else {
                              setSelectedStatus([...selectedStatus, option.value]);
                            }
                          }}
                        />
                        <span className="text-white">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* tìm kiếm theo tên khách hàng */}
            <input
              type="text"
              placeholder="Khách hàng"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
            />

            {/* tìm kiếm theo tên sản phẩm */}
            <input
              type="text"
              placeholder="Sản phẩm"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
            />

            {/* tìm kiếm theo hãng vận chuyển */}
            <div className="relative shipping-dropdown">
              <button
                onClick={() => setIsShippingOpen(!isShippingOpen)}
                className="bg-gray-800 text-gray-50 px-4 py-2 rounded-lg border border-gray-700 w-[200px] text-left flex justify-between items-center"
              >
                <span className="text-gray-50">
                  {selectedShipping.length > 0 ? `${selectedShipping.length} đã chọn` : 'Hãng vận chuyển'}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isShippingOpen && (
                <div className="absolute z-10 mt-1 w-[300px] bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                  <div className="p-2 flex items-center gap-2 bg-gray-800 border-b border-gray-700">
                    <input
                      type="checkbox"
                      checked={isAllSelectedShipping}
                      onChange={handleSelectAllShipping}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      value={searchShippingTerm}
                      onChange={(e) => setSearchShippingTerm(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none"
                    />
                  </div>
                  <div className="max-h-60 overflow-auto">
                    {filteredShippingOptions.map((option) => (
                      <label key={option.value} className="flex items-center px-3 py-2 hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mr-2"
                          checked={selectedShipping.includes(option.value)}
                          onChange={() => {
                            if (selectedShipping.includes(option.value)) {
                              setSelectedShipping(selectedShipping.filter(shipping => shipping !== option.value));
                            } else {
                              setSelectedShipping([...selectedShipping, option.value]);
                            }
                          }}
                        />
                        <span className="text-white">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              onClick={() => handleFilter(true)}
            >
              Lọc
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Date range picker (bộ chọn phạm vi ngày) */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-white">Từ ngày</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mb-6">
            {/* thêm mới đơn hàng */}
            <div className="relative add-new-dropdown">
              <button
                onClick={() => setIsAddNewOpen(!isAddNewOpen)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <span>Thêm mới</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isAddNewOpen && (
                <div className="absolute z-20 mt-1 w-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                  <div className="py-1">
                    <button
                      onClick={() => window.location.href = "/admin/orders/edit/0"}
                      className="w-full px-4 py-2 text-sm text-white hover:bg-gray-700 text-left flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Thêm mới
                    </button>
                    {/* <button
                      onClick={handleImportExcel}
                      className="w-full px-4 py-2 text-sm text-white hover:bg-gray-700 text-left flex items-center gap-2"
                    >
                      <FileDown size={16} strokeWidth={1.5} />
                      Nhập từ Excel
                    </button> */}
                  </div>
                </div>
              )}
            </div>
            {/* thao tác với đơn hàng */}
            <div className="relative action-dropdown">
              <button
                onClick={() => setIsActionOpen(!isActionOpen)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <span>Thao tác</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isActionOpen && (
                <div className="absolute z-20 mt-1 w-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                  <div className="py-1">
                    <button
                      onClick={handleChangeStatus}
                      className="w-full px-4 py-2 text-sm text-white hover:bg-gray-700 text-left flex items-center gap-2"
                    >
                      <ArrowLeftRight size={16} strokeWidth={1.5} />
                      Đổi trạng thái
                    </button>
                    <div className="border-t border-gray-700"></div>
                    {/* <button
                      onClick={handleExportExcel}
                      className="w-full px-4 py-2 text-sm text-white hover:bg-gray-700 text-left flex items-center gap-2"
                    >
                      <FileUp size={16} strokeWidth={1.5} />
                      Xuất excel
                    </button> */}
                    <div className="border-t border-gray-700"></div>
                    <button
                      onClick={handleDeleteOrders}
                      className="w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-700 text-left flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Xóa các đơn đã chọn
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* in đơn hàng */}
            <div className="relative print-dropdown">
              <button
                onClick={() => setIsPrintOpen(!isPrintOpen)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <span>In đơn</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isPrintOpen && (
                <div className="absolute z-20 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                  <div className="py-1">
                    <button
                      onClick={handlePrintA4A5}
                      className="w-full px-4 py-2 text-sm text-white hover:bg-gray-700 text-left flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      In phiếu gửi khổ A4, A5
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {!isLoading &&
          <div className="pt-4">
            <div className="overflow-hidden rounded-xl  bg-[#1f2636] p-4">
              <div className="max-w-full overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-400">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 sm:px-6 text-white text-[12px] text-left">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </th>
                      <th className="px-5 py-3 sm:px-6 text-white text-[12px] text-center">ID</th>
                      <th className="px-5 py-3 sm:px-6 text-white text-[12px] text-center">Khách hàng</th>
                      <th className="px-5 py-3 sm:px-6 text-white text-[12px] text-center">Sản phẩm</th>
                      <th className="px-5 py-3 sm:px-6 text-white text-[12px] text-center">Giá</th>
                      <th className="px-5 py-3 sm:px-6 text-white text-[12px] text-center">SL</th>
                      <th className="px-5 py-3 sm:px-6 text-white text-[12px] text-center">
                        <div className="flex justify-center">
                          <Truck size={16} strokeWidth={1.5} />
                        </div>
                      </th>
                      <th className="px-5 py-3 sm:px-6 text-white text-[12px] text-center">
                        <div className="flex justify-center">
                          <Banknote size={16} strokeWidth={1.5} />
                        </div>
                      </th>
                      <th className="px-5 py-3 sm:px-6 text-white text-[12px] text-center">
                        <div className="flex justify-center">
                          <NotebookPen size={16} strokeWidth={1.5} />
                        </div>
                      </th>
                      <th className="px-5 py-3 sm:px-6 text-white text-[12px] text-center">
                        <div className="flex justify-center">
                          <Check size={16} strokeWidth={1.5} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-5 py-4 sm:px-6 text-white text-left">
                          <input
                            type="checkbox"
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={() => handleSelectOne(order.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </td>
                        <td className="px-5 py-4 sm:px-6 text-white text-left">
                          {order.id}
                          <div className="text-xs text-gray-400">
                            {order.order_date
                              ? new Date(order.order_date).toLocaleString("vi-VN")
                              : ""}
                          </div>
                        </td>
                        <td className="px-5 py-4 sm:px-6 text-white text-left">
                          <div className="text-white text-left py-1">{order.phone_number}</div>
                          <div className="text-white text-left py-1">{order.full_name}</div>
                          <div className="text-white text-left py-1">{order.address + ", " + order.ward + ", " + order.district + ", " + order.city}</div>
                        </td>
                        <td className="px-5 py-4 sm:px-6 text-white text-left">
                          {order.order_details.map((detail) => (
                            <div key={detail.product_id} className="text-white text-left py-1">
                              {detail.product_name}
                              <hr />
                            </div>
                          ))}
                        </td>
                        <td className="px-5 py-4 sm:px-6 text-white text-right">
                          {order.order_details.map((detail) => (
                            <div key={detail.product_id} className="text-white text-right py-1">
                              {detail.price.toLocaleString("vi-VN")}
                              <hr />
                            </div>
                          ))}
                        </td>
                        <td className="px-5 py-4 sm:px-6 text-white text-right">
                          {order.order_details.map((detail) => (
                            <div key={detail.product_id} className="text-white text-right py-1">
                              {detail.quantity}
                              <hr />
                            </div>

                          ))}
                        </td>
                        <td className="px-5 py-4 sm:px-6 text-white text-center">{order.shipping_method}</td>
                        <td className="px-5 py-4 sm:px-6 text-white text-right">
                          {/* Tổng tiền trước giảm */}
                          {order.order_details
                            .reduce((total, detail) => total + detail.price * detail.quantity, 0)
                            .toLocaleString("vi-VN")}
                          <br />
                          {/* Chỉ hiển thị nếu có voucher */}
                          {order.vouchers && order.vouchers.length > 0 && (
                            <>
                              {/* Tổng giảm giá */}
                              <span className="text-sm text-gray-400">
                                -{order.vouchers
                                  .reduce((total: number, detail: { discount_amount: number }) => total + detail.discount_amount, 0)
                                  .toLocaleString("vi-VN")}
                              </span>
                              <br />
                              {/* Tổng tiền sau giảm */}
                              <span className="text-blue-400 font-bold">
                                {(
                                  order.order_details.reduce((total, detail) => total + detail.price * detail.quantity, 0) -
                                  order.vouchers.reduce((total: number, detail: { discount_amount: number }) => total + detail.discount_amount, 0)
                                ).toLocaleString("vi-VN")}
                                ₫
                              </span>
                            </>
                          )}
                        </td>
                        <td className="px-5 py-4 sm:px-6 text-white text-left">
                          {order.note ? (
                            <div className="text-white text-left py-1">{order.note}</div>
                          ) : (
                            <div className="text-white text-left py-1">Không có ghi chú</div>
                          )}
                        </td>
                        <td className="px-5 py-4 sm:px-6 text-center relative">
                          <div className="relative menu-dropdown">
                            <button
                              onClick={() => setActiveMenuOrderId(activeMenuOrderId === order.id ? null : order.id)}
                              className={`rounded-full px-4 py-2 text-[12px] font-medium flex items-center gap-2 ${statusStyles[order.status as keyof typeof statusStyles] || ""
                                }`}
                            >
                              <span>{order.status}</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {activeMenuOrderId === order.id && (
                              <div className="absolute z-30 right-0 bottom-full mb-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                                <div className="py-1">
                                  <button
                                    className="w-full px-4 py-2 text-sm text-white hover:bg-gray-700 text-left flex items-center gap-2"
                                    onClick={() => {
                                      window.location.href = `/admin/orders/edit/${order.id}`;
                                      setActiveMenuOrderId(null);
                                    }}
                                  >
                                    <NotebookPen className="w-4 h-4" />
                                    <span>Sửa đơn hàng</span>
                                  </button>

                                  <button
                                    className="w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-700 text-left flex items-center gap-2"
                                    onClick={() => {
                                      // Xử lý xóa đơn hàng
                                      handleDeleteOrder(order.id);
                                      setActiveMenuOrderId(null);
                                    }}
                                  >
                                    <NotebookPen className="w-4 h-4" />
                                    <span>Xóa đơn hàng</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pagination section */}
            <div className="flex justify-center items-center mt-4 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1 text-sm font-medium text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index)}
                  className={`px-3 py-1 text-sm font-medium rounded-lg ${currentPage === index
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 text-sm font-medium text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        }
        <ChangeStatusModal
          isOpen={isChangeStatusModalOpen}
          onClose={() => setIsChangeStatusModalOpen(false)}
          selectedOrderIds={selectedOrderIds}
          onChangeStatus={handleStatusChange}
        />
      </div>
    </main >
  );
};

export default ListOrder;