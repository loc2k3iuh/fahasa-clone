import { Check, House, MapPinHouse, Minus, NotebookPen, Phone, Plus, Search, TicketPercent, User, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { orderService } from "../../services/orderService";
import { productService } from "../../services/productService";
import { toast } from "sonner";
import { District, fetchDistrictsByProvince, fetchWardsByDistrict, Province, Ward } from "../../services/addressService";
import voucherService from "../../services/voucherService";
import { set } from "react-hook-form";


interface Product {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  imageUrl: string;
  stockQuantity: number;
}

interface ValidationErrors {
  customerPhone?: string;
  customerName?: string;
  customerAddress?: string;
  email?: string;
  city?: string;
  district?: string;
  ward?: string;
  products?: string;
}
const EditOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Update title based on mode
  useEffect(() => {
    document.title = id === "0" ? "Add Order" : "Edit Order";
  }, [id]);

  const statusOptions = [
    { value: 'PENDING', label: 'Chờ xác nhận' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'PACKING', label: 'Đang đóng gói' },
    { value: 'DELIVERING', label: 'Đang giao hàng' },
    { value: 'COMPLETED', label: 'Thành công' },
    { value: 'CANCELLED', label: 'Đã hủy' }
  ];
  const statusStyles = {
    PENDING: "text-yellow-400",
    CONFIRMED: "text-blue-400",
    PACKING: "text-purple-400",
    DELIVERING: "text-orange-400",
    COMPLETED: "text-green-400",
    CANCELLED: "text-red-400"
  };
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfItems, setNumberOfItems] = useState(0);
  const [orderDate, setOrderDate] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [note, setNote] = useState("");
  const [voucherCode, setVoucherCode] = useState('');
  const [status, setStatus] = useState(statusOptions[0].value);
  const [shippingMethod, setShippingMethod] = useState("");
  const [email, setEmail] = useState("");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [cityName, setCityName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [wardName, setWardName] = useState('');

  const fetchProvinces = async () => {
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/');
      const data = await response.json();
      setProvinces(data);
    } catch (error) {
      console.error('Error fetching provinces:', error);
    }
  };

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = e.target.value;
    const selectedProvince = provinces.find((p: Province) => parseInt(p.code) === parseInt(provinceCode));

    setCity(provinceCode);
    setCityName(selectedProvince?.name || '');
    setDistrict('');
    setDistrictName('');
    setWard('');
    setWardName('');

    if (provinceCode) {
      try {
        const districts = await fetchDistrictsByProvince(provinceCode);
        setDistricts(districts);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    } else {
      setDistricts([]);
    }
    setWards([]);
  };

  // Update handleDistrictChange
  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtCode = e.target.value;
    const selectedDistrict = districts.find((d: District) => parseInt(d.code) === parseInt(districtCode));

    setDistrict(districtCode);
    setDistrictName(selectedDistrict?.name || '');
    setWard('');
    setWardName('');

    if (districtCode) {
      try {
        const wards = await fetchWardsByDistrict(districtCode);
        setWards(wards);
      } catch (error) {
        console.error('Error fetching wards:', error);
      }
    } else {
      setWards([]);
    }
  };

  // Update handle ward change
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardCode = e.target.value;
    const selectedWard = wards.find((w: Ward) => parseInt(w.code) === parseInt(wardCode));

    setWard(wardCode);
    setWardName(selectedWard?.name || '');
  };




  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<Product>>([]);
  const [products, setProducts] = useState<Array<Product>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Tính tổng giá trị đơn hàng
  const calculateTotal = () => {
    return products.reduce((sum, product) => sum + product.total, 0); // Thêm phí ship
  };

  // Xử lý tìm kiếm sản phẩm

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true); // Bắt đầu loading
    try {
      const results = await productService.searchProducts(query);

      setSearchResults(results);
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false); // Kết thúc loading
    }
  };

  // Add these new states
  const [promoSearchQuery, setPromoSearchQuery] = useState('');
  const [promoSearchResults, setPromoSearchResults] = useState<Array<any>>([]);
  const [isSearchingPromo, setIsSearchingPromo] = useState(false);
  const [appliedPromotions, setAppliedPromotions] = useState<Array<any>>([]);

  // Add these new functions
  const handlePromoSearch = async (query: string) => {
    setPromoSearchQuery(query);

    if (query.trim() === '') {
      setPromoSearchResults([]);
      setIsSearchingPromo(false);
      return;
    }

    setIsSearchingPromo(true);
    try {
      // Replace this with your actual API call
      const results = await voucherService.searchVouchersByName(query);
      console.log("Promo search results:", results.result.content);

      setPromoSearchResults(results.result.content);
    } catch (error) {
      console.error("Error searching promotions:", error);
      setPromoSearchResults([]);
    } finally {
      setIsSearchingPromo(false);
    }
  };

  const handleAddPromotion = (promo: any) => {
    if (!appliedPromotions.some(p => p.code === promo.code)) {
      setAppliedPromotions([...appliedPromotions, promo]);
    }
    setPromoSearchQuery('');
    setPromoSearchResults([]);
  };

  const removePromotion = (code: string) => {
    setAppliedPromotions(appliedPromotions.filter(p => p.code !== code));
  };

  const calculateTotalDiscount = () => {
    return appliedPromotions.reduce((sum, promo) => sum + promo.discount_amount, 0);
  };

  const calculateFinalTotal = () => {
    const subtotal = calculateTotal();
    const discount = calculateTotalDiscount();
    return Math.max(subtotal - discount, 0); // Ensure total doesn't go below 0
  };


  // Xử lý thêm sản phẩm vào giỏ hàng
  const handleAddProduct = (product: Product) => {

    // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    const existingProduct = products.find(p => p.id === product.id);

    if (existingProduct) {
      // Nếu sản phẩm đã tồn tại, tăng số lượng
      const updatedProducts = products.map(p =>
        p.id === product.id
          ? { ...p, quantity: p.quantity + 1, total: (p.quantity + 1) * p.price }
          : p
      );
      setProducts(updatedProducts);
    } else {
      // Nếu chưa có, thêm sản phẩm mới
      const newProduct = {
        id: product.id,
        productName: product.productName,
        price: product.price,
        quantity: 1,
        total: product.price,
        imageUrl: product.imageUrl,
        stockQuantity: product.quantity
      };
      setProducts([...products, newProduct]);
    }

    // Xóa kết quả tìm kiếm sau khi thêm
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };


  // Cập nhật số lượng sản phẩm
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) return;

    const updatedProducts = products.map(p =>
      p.id === id
        ? { ...p, quantity: newQuantity, total: p.price * newQuantity }
        : p
    );

    setProducts(updatedProducts);
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // Đóng kết quả tìm kiếm khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = () => {
      if (isSearching) {
        setSearchResults([]);
        setIsSearching(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearching]);

  useEffect(() => {
    fetchProvinces();
  }, []);


  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true);
      try {
        const orderId = parseInt(id || "0");
        if (orderId === 0) return;

        const response = await orderService.getOrderById(orderId);
        console.log("Fetched order:", response);

        const orderData = response.result

        // Map customer information
        setCustomerName(orderData.full_name || '');
        setCustomerPhone(orderData.phone_number || '');
        setCustomerAddress(orderData.address || '');
        setEmail(orderData.email || '');

        if (orderData.city) {
          const response = await fetch('https://provinces.open-api.vn/api/p/');
          const data = await response.json();

          const foundProvince = data.find((p: Province) => p.name === orderData.city);
          if (foundProvince) {
            setCity(foundProvince.code);
            setCityName(foundProvince.name);

            const districts = await fetchDistrictsByProvince(foundProvince.code);
            setDistricts(districts);

            // Find district by name
            const foundDistrict = districts.find((d: District) => d.name === orderData.district);
            if (foundDistrict) {
              setDistrict(foundDistrict.code);
              setDistrictName(foundDistrict.name);

              const wards = await fetchWardsByDistrict(foundDistrict.code);
              setWards(wards);

              // Find ward by name
              const foundWard = wards.find((w: Ward) => w.name === orderData.ward);
              if (foundWard) {
                setWard(foundWard.code);
                setWardName(foundWard.name);
              }
            }
          }
        }

        // Map order details
        setOrderDate(orderData.order_date || '');
        setStatus(orderData.status || 'PENDING');
        setNote(orderData.note || '');
        setShippingMethod(orderData.shipping_method || 'STANDARD');
        setVoucherCode(orderData.discount_code || '');
        setAppliedPromotions(orderData.vouchers || []); // Assuming voucher_ids is an array of applied promotions

        // Map products
        const orderProducts = orderData.order_details.map((detail: any) => ({
          id: detail.product_id,
          productName: detail.product_name,
          price: detail.price,
          quantity: detail.quantity,
          total: detail.price * detail.quantity,
          imageUrl: detail.image_url,
          stockQuantity: detail.stock_quantity
        }));

        setProducts(orderProducts);
        setNumberOfItems(orderProducts.reduce((sum: number, product: any) => sum + product.quantity, 0));

      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id !== "0") {
      fetchOrder();
    }
  }, [id]);

  const validateOrderData = (): ValidationErrors | null => {
    const errors: ValidationErrors = {};

    // Validate phone number
    if (!customerPhone) {
      errors.customerPhone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(customerPhone)) {
      errors.customerPhone = 'Số điện thoại không hợp lệ';
    }

    // Add email validation
    if (email) { // Only validate if email is provided (optional field)
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(email)) {
        errors.email = 'Email không hợp lệ';
      }
    }

    // Validate customer name
    if (!customerName) {
      errors.customerName = 'Vui lòng nhập tên khách hàng';
    }

    // Validate address
    if (!customerAddress) {
      errors.customerAddress = 'Vui lòng nhập địa chỉ';
    }

    // Validate location
    if (!city) {
      errors.city = 'Vui lòng chọn Tỉnh/Thành phố';
    }
    if (!district) {
      errors.district = 'Vui lòng chọn Quận/Huyện';
    }
    if (!ward) {
      errors.ward = 'Vui lòng chọn Phường/Xã';
    }

    // Validate products
    if (products.length === 0) {
      errors.products = 'Vui lòng thêm sản phẩm vào đơn hàng';
    } else {
      // Check product quantities
      const invalidProducts = products.filter(p =>
        p.quantity <= 0 || (id === "0" ? p.quantity > p.stockQuantity : false)
      );
      if (invalidProducts.length > 0) {
        errors.products = 'Số lượng sản phẩm không hợp lệ';
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
  const handleUpdateOrder = async () => {
    try {
      setIsLoading(true);

      // Validate data
      const errors = validateOrderData();
      if (errors) {
        // Show first error message
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
        return;
      }

      // Prepare order details
      const orderDetails = products.map(product => ({
        product_id: product.id,
        quantity: product.quantity,
      }));

      // Prepare order data
      const orderData = {
        full_name: customerName,
        phone_number: customerPhone,
        email: email, // Add email field if needed
        address: customerAddress,
        city: cityName,
        district: districtName,
        ward: wardName,
        shipping_method: shippingMethod || 'STANDARD',
        payment_method: 'CASH_ON_DELIVERY', // Add payment method selection if needed
        note: note,
        status: status,
        cart_items: orderDetails,
        voucher_ids: appliedPromotions.map(promo => promo.id), // Assuming you want to send the IDs of the applied promotions
      };

      const orderId = parseInt(id || "0");
      if (orderId === 0) {
        // Create new order
        const response = await orderService.createOrder(orderData);
        if (response.code === 200) {
          toast.success('Tạo đơn hàng thành công!');
          window.location.href = '/admin/orders';
        } else {
          toast.error(`Lỗi: ${response.message}`);
        }
      } else {
        // Update existing order
        const response = await orderService.updateOrder(orderId, orderData);
        if (response.code === 200) {
          toast.success('Cập nhật đơn hàng thành công!');
        } else {
          toast.error(`Lỗi: ${response.message}`);
        }
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Đã có lỗi xảy ra khi cập nhật đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };


  const saveDraft = () => {
    if (customerPhone) {
      alert("Draft saved successfully!");
    } else {
      alert("Phone number is required to save draft!");
    }
  };



  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-7xl md:p-6 mb-15">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white/90">
            {id === "0" ? "Add Order" : "Edit Order"}
          </h2>
          <nav>
            <ol className="flex items-center gap-1.5">
              <li>
                <a
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500"
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
                      stroke=""
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500"
                  href="/admin/orders"
                >
                  Orders
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
                      stroke=""
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </a>
              </li>
              <li className="text-sm text-white/90">
                {id === "0" ? "Add Order" : "Edit Order"}
              </li>
            </ol>
          </nav>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        {!isLoading && (
          <div>
            {/* thông tin khách hàng */}
            <div className="pt-5">
              <div className="card overflow-hidden rounded-xl border border-gray-800 bg-gray-800 mb-4">
                <div className="card-header bg-gray-700 py-3 px-4 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white">
                    Khách hàng
                  </h2>
                </div>

                <div className="card-body p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <span className="bg-gray-700 p-2 rounded-l-lg border border-gray-600">
                              <Phone size={24} strokeWidth={1} color="white" />
                            </span>
                            <input
                              type="text"
                              placeholder="Điện thoại"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className="flex-1 bg-gray-700 text-white px-3 py-2 border border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <button
                          onClick={saveDraft}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg border border-gray-600"
                          title="Lưu nháp (Chỉ cần số điện thoại)"
                        >
                          💾
                        </button>
                      </div>

                      <div className="flex items-center">
                        <span className="bg-gray-700 p-2 rounded-l-lg border border-gray-600">
                          <User strokeWidth={1} color="white" />
                        </span>
                        <input
                          type="text"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 bg-gray-700 text-white px-3 py-2 border border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <span className="bg-gray-700 p-2 rounded-l-lg border border-gray-600">
                          <User strokeWidth={1} color="white" />
                        </span>
                        <input
                          type="text"
                          placeholder="Tên khách"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="flex-1 bg-gray-700 text-white px-3 py-2 border border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <span className="bg-gray-700 p-2 rounded-l-lg border border-gray-600">
                          <House strokeWidth={1} absoluteStrokeWidth color="white" />
                        </span>
                        <textarea
                          placeholder="Địa chỉ"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          rows={1}
                          className="flex-1 bg-gray-700 text-white px-3 py-2 border border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex items-center">
                        <span className="bg-gray-700 p-2 rounded-l-lg border border-gray-600">
                          <NotebookPen strokeWidth={1} absoluteStrokeWidth color="white" />
                        </span>
                        <textarea
                          placeholder="Ghi chú khách hàng (Để in)"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={1}
                          className="flex-1 bg-gray-700 text-white px-3 py-2 border border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      {/* Province/City Selection */}
                      <div className="flex items-center">
                        <span className="bg-gray-700 p-2 rounded-l-lg border border-gray-600">
                          <MapPinHouse strokeWidth={1} absoluteStrokeWidth color="white" />
                        </span>
                        <select
                          value={city}
                          onChange={handleProvinceChange}
                          className="flex-1 bg-gray-700 text-white px-3 py-2 border border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">- Chọn Tỉnh/Thành phố -</option>
                          {provinces.map(province => (
                            <option key={province.code} value={province.code}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* District Selection */}
                      <div className="flex items-center">
                        <span className="bg-gray-700 p-2 rounded-l-lg border border-gray-600">
                          <MapPinHouse strokeWidth={1} absoluteStrokeWidth color="white" />
                        </span>
                        <select
                          value={district}
                          onChange={handleDistrictChange}
                          className="flex-1 bg-gray-700 text-white px-3 py-2 border border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={!city}
                        >
                          <option value="">- Chọn Quận/Huyện -</option>
                          {districts.map(district => (
                            <option key={district.code} value={district.code}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Ward Selection */}
                      <div className="flex items-center">
                        <span className="bg-gray-700 p-2 rounded-l-lg border border-gray-600">
                          <MapPinHouse strokeWidth={1} absoluteStrokeWidth color="white" />
                        </span>
                        <select
                          value={ward}
                          onChange={handleWardChange}
                          className="flex-1 bg-gray-700 text-white px-3 py-2 border border-gray-600 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled={!district}
                        >
                          <option value="">- Chọn Phường/Xã -</option>
                          {wards.map(ward => (
                            <option key={ward.code} value={ward.code}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* thông tin đơn hàng */}
            <div className="card overflow-hidden rounded-xl border border-gray-800 bg-gray-800 mb-4">
              <div className="card-header bg-gray-700 py-3 px-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  Sản phẩm
                </h2>
              </div>

              <div className="card-body p-4">
                {/* Khung tìm kiếm */}
                <div className="mb-6 relative">
                  <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden border border-gray-600 focus-within:ring-2 focus-within:ring-blue-500">
                    <div className="pl-3">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full bg-transparent text-white px-3 py-3 focus:outline-none"
                    />
                    {isSearching && (
                      <div className="pr-3">
                        <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Kết quả tìm kiếm */}
                  {searchResults.length > 0 && !isSearching && (
                    <div className="absolute z-10 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-full mt-2 max-h-64 overflow-y-auto">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddProduct(product);
                          }}
                        >
                          <div className="w-12 h-12 bg-gray-600 rounded-md overflow-hidden flex-shrink-0">
                            <img
                              src={product.imageUrl}
                              alt={product.productName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{product.productName}</h3>
                            <p className="text-blue-400">{product.price.toLocaleString("vi-VN")} ₫</p>
                          </div>
                          <div className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 p-1 rounded-full">
                            <Plus size={16} className="text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hiển thị trạng thái loading */}
                  {isSearching && searchQuery && (
                    <div className="absolute z-10 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-full mt-2 p-4">
                      <div className="flex items-center justify-center text-gray-400">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang tìm kiếm...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Danh sách sản phẩm */}
                {products.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-gray-700">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="text-left text-gray-300 py-3 px-4">Sản phẩm</th>
                          <th className="w-24 text-center text-gray-300 py-3 px-4">Tồn</th>
                          <th className="w-24 text-center text-gray-300 py-3 px-4">SL</th>
                          <th className="w-36 text-right text-gray-300 py-3 px-4">Đơn giá</th>
                          <th className="w-36 text-right text-gray-300 py-3 px-4">Thành tiền</th>
                          <th className="w-12 py-3 px-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-t border-gray-700 hover:bg-gray-750">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-600 rounded-md overflow-hidden">
                                  <img
                                    src={product.imageUrl}
                                    alt={product.productName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="text-white">{product.productName}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`text-gray-300 ${product.stockQuantity <= 10 ? 'text-red-400' : ''}`}>
                                {product.stockQuantity}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => updateQuantity(product.id, product.quantity - 1)}
                                  className="bg-gray-700 text-gray-300 hover:bg-gray-600 p-1 rounded"
                                  disabled={product.quantity <= 1}
                                >
                                  <Minus size={14} />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={product.stockQuantity}
                                  value={product.quantity}
                                  onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                                  className="w-12 bg-gray-700 text-white text-center px-1 py-1 rounded border border-gray-600"
                                />
                                <button
                                  onClick={() => updateQuantity(product.id, product.quantity + 1)}
                                  className="bg-gray-700 text-gray-300 hover:bg-gray-600 p-1 rounded"
                                  disabled={product.quantity >= product.stockQuantity}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right font-medium text-blue-400">
                              {product.price.toLocaleString("vi-VN")} ₫
                            </td>
                            <td className="py-4 px-4 text-right font-medium text-blue-400">
                              {product.total.toLocaleString("vi-VN")} ₫
                            </td>
                            <td className="py-4 px-4">
                              <button
                                onClick={() => removeProduct(product.id)}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-1 rounded-full"
                              >
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-700">
                        <tr>
                          <td colSpan={3} className="py-4 px-4 text-white font-medium">
                            Tổng cộng
                          </td>
                          <td colSpan={2} className="py-4 px-4 text-right font-bold text-blue-400">
                            {calculateTotal().toLocaleString("vi-VN")} ₫
                          </td>
                          <td className="py-4 px-4"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-750 rounded-lg border border-gray-700">
                    <div className="flex justify-center mb-3">
                      {/* <ShoppingCart size={48} className="text-gray-500" /> */}
                    </div>
                    <p className="text-gray-400">Chưa có sản phẩm trong giỏ hàng</p>
                    <p className="text-gray-500 text-sm mt-2">Tìm kiếm và thêm sản phẩm vào giỏ hàng</p>
                  </div>
                )}
              </div>

            </div>
            {/* thông tin khuyen mai va thanh toan */}
            <div className="card overflow-hidden rounded-xl border border-gray-800 bg-gray-800 mb-4">
              <div className="card-header bg-gray-700 py-3 px-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  Khuyến mãi
                </h2>
              </div>

              <div className="card-body p-4">
                {/* Search Promotions */}
                <div className="mb-6 relative">
                  <div className="flex items-center bg-gray-700 rounded-lg overflow-hidden border border-gray-600 focus-within:ring-2 focus-within:ring-blue-500">
                    <div className="pl-3">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Tìm kiếm mã khuyến mãi..."
                      value={promoSearchQuery}
                      onChange={(e) => handlePromoSearch(e.target.value)}
                      className="w-full bg-transparent text-white px-3 py-3 focus:outline-none"
                      disabled={id !== "0"} // Disable khi đang edit
                    />
                    {isSearchingPromo && (
                      <div className="pr-3">
                        <div className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Search Results */}
                  {promoSearchResults.length > 0 && !isSearchingPromo && (
                    <div className="absolute z-10 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-full mt-2 max-h-64 overflow-y-auto">
                      {promoSearchResults.length > 0 && !isSearchingPromo && (
                        <div className="absolute z-10 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-full mt-2 max-h-64 overflow-y-auto">
                          {promoSearchResults.map((promo) => (
                            <div
                              key={promo.code}
                              className={`flex items-center gap-3 p-3 border-b border-gray-700 last:border-0 ${id !== "0" ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700 cursor-pointer"}`}
                              onClick={() => id === "0" && handleAddPromotion(promo)} // Chỉ cho thêm khi tạo mới
                            >
                              {/* ...existing code... */}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Loading State */}
                  {isSearchingPromo && promoSearchQuery && (
                    <div className="absolute z-10 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-full mt-2 p-4">
                      <div className="flex items-center justify-center text-gray-400">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span>Đang tìm kiếm...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Applied Promotions List */}
                {appliedPromotions.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-gray-700">
                    <table className="w-full">
                      <thead className="bg-gray-700">
                        <tr>
                          <th className="text-left text-gray-300 py-3 px-4">Mã khuyến mãi</th>
                          <th className="text-left text-gray-300 py-3 px-4">Mô tả</th>
                          <th className="w-36 text-right text-gray-300 py-3 px-4">Giảm giá</th>
                          <th className="w-12 py-3 px-4"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {appliedPromotions.map((promo) => (
                          <tr key={promo.code} className="border-t border-gray-700 hover:bg-gray-750">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-600 rounded-md overflow-hidden flex items-center justify-center">
                                  <TicketPercent size={20} className="text-blue-400" />
                                </div>
                                <span className="text-white font-medium">{promo.code}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-300">{promo.discount_name}</td>
                            <td className="py-4 px-4 text-right font-medium text-green-400">
                              -{promo.discount_amount.toLocaleString("vi-VN")} ₫
                            </td>
                            <td className="py-4 px-4">
                              <button
                                onClick={() => removePromotion(promo.code)}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-1 rounded-full"
                                disabled={id !== "0"} // Disable khi đang edit
                                title={id !== "0" ? "Không thể xóa voucher khi chỉnh sửa đơn hàng" : ""}
                              >
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-700">
                        <tr>
                          <td colSpan={2} className="py-4 px-4 text-white font-medium">
                            Tổng giảm giá
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-green-400">
                            -{calculateTotalDiscount().toLocaleString("vi-VN")} ₫
                          </td>
                          <td className="py-4 px-4"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-750 rounded-lg border border-gray-700">
                    <div className="flex justify-center mb-3">
                      <TicketPercent size={48} className="text-gray-500" />
                    </div>
                    <p className="text-gray-400">Chưa áp dụng khuyến mãi</p>
                    <p className="text-gray-500 text-sm mt-2">Tìm kiếm và thêm mã khuyến mãi</p>
                  </div>
                )}
              </div>
            </div>
            {/* thông tin giao hang */}
            <div className="space-y-4">
              {/* Shipping Method */}
              <div className="card overflow-hidden rounded-xl border border-gray-800 bg-gray-800">
                <div className="card-body p-4 space-y-4">
                  <select
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
                  >
                    <option value="shop">Giao hàng tiêu chuẩn</option>
                  </select>
                  {/* Commission Status */}
                  <div className="flex items-center gap-2">
                    <span className="w-8"><Check strokeWidth={1} absoluteStrokeWidth color="white" /></span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600"
                    >
                      {statusOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className={statusStyles[option.value as keyof typeof statusStyles]}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>


                  {/* Total Amount Display */}
                  <div className="space-y-2 text-white py-2">
                    {/* <div className="flex justify-between">
                      <div>Phí vận chuyển:</div>
                      <div className="font-medium">{(20000).toLocaleString("vi-VN")} ₫</div>
                    </div> */}
                    <div className="flex justify-between">
                      <div>Tạm tính:</div>
                      <div className="font-medium">{(calculateTotal()).toLocaleString("vi-VN")} ₫</div>
                    </div>
                    <div className="flex justify-between text-green-400">
                      <div>Giảm giá:</div>
                      <div className="font-medium">-{calculateTotalDiscount().toLocaleString("vi-VN")} ₫</div>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-gray-700">
                      <div>Tổng thanh toán:</div>
                      <div className="text-xl font-bold text-blue-400">
                        {calculateFinalTotal().toLocaleString("vi-VN")} ₫
                      </div>
                    </div>
                  </div>


                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateOrder}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                          Đang lưu...
                        </div>
                      ) : (
                        <>
                          Lưu
                        </>
                      )}
                    </button>
                    {/* <button
                      onClick={async () => {
                        await handleUpdateOrder();
                        // Add print logic here
                        await orderService.generateOrderPdfUrl([parseInt(id || "0")]);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                          Đang xử lý...
                        </div>
                      ) : (
                        <>
                          Lưu và in
                        </>
                      )}
                    </button> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main >
  );
};

export default EditOrder;