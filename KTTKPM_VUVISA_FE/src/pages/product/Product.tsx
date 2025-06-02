import React, { useState, useEffect, useRef } from "react";
import { Truck, RefreshCcw, Gift, Plus, Minus, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { AxiosResponse } from "axios";
import Swal from 'sweetalert2';
import { Trash2, Edit, Loader } from 'lucide-react';

import { useUserService } from "../../services/useUserService";
import reviewService from "../../services/reviewService";
import apiService from "../../services/apiService";
import { cartService } from "../../services/cartService";

import { Heart, HeartOff } from 'lucide-react';
import favoriteService from "../../services/FavoriteService";

// Define types for our data
interface Author {
  id: number;
  authorName: string;
  description: string;
}

interface Publisher {
  id: number;
  publisherName: string;
  description: string;
}

interface Category {
  id: number;
  categoryName: string;
  description: string;
  type: string;
}

interface Supplier {
  id: number;
  supplierName: string;
  description: string;
}

interface ImageProduct {
  id: number;
  description: string;
  url: string;
}

interface Discount {
  id: number;
  discountName?: string;
  discountPercentage?: number;
  discountAmount?: number;
  startDate?: number[]; // [year, month, day]
  endDate?: number[];   // [year, month, day]
}

interface Book {
  id: number;
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  isbn: string;
  publisherDate: string;
  category: Category;
  supplier: Supplier;
  publisher: Publisher;
  authors: Author[];
  imageProducts: ImageProduct[];
  discounts?: Discount[];
}

interface OfficeSupply {
  id: number;
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  category: Category;
  supplier: Supplier;
  imageProducts: ImageProduct[];
  classify: string;
  discounts?: Discount[];
}

type Product = Book | OfficeSupply;

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

interface RelatedProduct {
  id: number;
  productName: string;
  imageUrl: string;
  price: number;
  stockQuantity: number;
  category: Category;
  supplier: Supplier;
}

interface Review {
  id: number;
  comment: string;
  rating: number;
  createdAt: string | number[];
  updatedAt: string;
  user: {
    id: number;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

const Product = () => {

  //Product
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [productType, setProductType] = useState<"SACH_TRONG_NUOC" | "SACH_NUOC_NGOAI" | "VAN_PHONG_PHAM">("SACH_TRONG_NUOC");
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);

  //User / Review
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<{ fullName: string; username: string; avatar_url: string; } | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const { getUserResponseFromLocalStorage } = useUserService();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Address
  const [userAddress, setUserAddress] = useState("Chưa rõ địa chỉ.");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("3-5 ngày tới");

  //Description
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionOverflow, setIsDescriptionOverflow] = useState(false);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Thêm state để theo dõi số lượng trong giỏ
  const [cartQuantity, setCartQuantity] = useState<number>(0);
  const [maxQuantityAvailable, setMaxQuantityAvailable] = useState<number>(0);

  //Favorite
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [favoriteCount, setFavoriteCount] = useState<number>(0);
  const [processingFavorite, setProcessingFavorite] = useState<boolean>(false);

  // Thêm state cho lightbox (đặt trong component)
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxMedia, setLightboxMedia] = useState<string>("");
  const [lightboxType, setLightboxType] = useState<"image" | "video">("image");
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState<number>(0);
  const [allMedia, setAllMedia] = useState<{ url: string, type: "image" | "video" }[]>([]);

  const [scrollX, setScrollX] = useState(0);

  const scrollLeft = () => {
    setScrollX(scrollX + 300);
  };

  const scrollRight = () => {
    setScrollX(scrollX - 300);
  };

  /**
   * Helper function to check if a product is a book
   * Used for type checking in UI rendering
   */
  const isBookType = (type: string): boolean => {
    return type === "SACH_TRONG_NUOC" || type === "SACH_NUOC_NGOAI";
  };

  // Hàm mở lightbox
  const openLightbox = (mediaUrl: string) => {
    setLightboxMedia(mediaUrl);
    setLightboxType(mediaUrl.endsWith('.mp4') ? 'video' : 'image');

    // Tìm index của media được click trong mảng allMedia
    const index = allMedia.findIndex(item => item.url === mediaUrl);
    setCurrentLightboxIndex(index >= 0 ? index : 0);

    setLightboxOpen(true);
    document.body.style.overflow = 'hidden'; // Ngăn cuộn khi lightbox mở
  };

  // Hàm đóng lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = ''; // Restore scrolling
  };

  // Hàm điều hướng giữa các hình ảnh trong lightbox
  const navigateLightbox = (direction: 'next' | 'prev') => {
    if (!allMedia.length) return;

    let newIndex = currentLightboxIndex;

    if (direction === 'next') {
      newIndex = (currentLightboxIndex + 1) % allMedia.length;
    } else {
      newIndex = (currentLightboxIndex - 1 + allMedia.length) % allMedia.length;
    }

    // Cập nhật media và loại media
    setLightboxMedia(allMedia[newIndex].url);
    setLightboxType(allMedia[newIndex].type);
    setCurrentLightboxIndex(newIndex);
  };

  // Thêm bắt sự kiện phím để điều hướng bằng bàn phím
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;

      switch (e.key) {
        case 'ArrowLeft':
          navigateLightbox('prev');
          break;
        case 'ArrowRight':
          navigateLightbox('next');
          break;
        case 'Escape':
          closeLightbox();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [lightboxOpen, currentLightboxIndex, allMedia]);

  /**
   * Function to fetch product by ID
   * Makes an API call to get product data based on product type
   *
   * @param id - The product ID to fetch
   * @param type - The product type (book or office supply)
   */
  const fetchProductById = async (id: string, type?: string) => {
    const toastId = toast.loading("Loading product...");
    try {
      // Determine the endpoint based on the product type
      let endpoint = '';

      if (type) {
        // If type is provided, use it to determine the endpoint
        endpoint = isBookType(type)
          ? `/products/books/${id}`
          : `/products/office-supplies/${id}`;
      } else {
        // If type is not provided, try to fetch as a book first
        try {
          const bookResponse = await apiService.get(`/products/books/${id}`);
          if (bookResponse.data) {
            handleApiResponse(bookResponse);
            toast.success("Product loaded successfully!", { id: toastId });
            return;
          }
        } catch {
          console.log("Not a book, trying office supply...");
          // If not a book, try as office supply
          endpoint = `/products/office-supplies/${id}`;
        }
      }

      const response = await apiService.get(endpoint);
      handleApiResponse(response);
      toast.success("Product loaded successfully!", { id: toastId });
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to fetch product. Please try again.", { id: toastId });
      // In a real app, you might want to show an error message to the user
      // or redirect to an error page
    }
  };

  const fetchRelatedProducts = async (productId: number, limit: number = 10) => {
    try {
      const response = await apiService.get(`/products/${productId}/related`, {
        params: { limit }
      });

      // Handle different response formats
      let relatedProductsData: RelatedProduct[] = [];
      if (response.data && response.data.result) {
        relatedProductsData = response.data.result;
      } else if (Array.isArray(response.data)) {
        relatedProductsData = response.data;
      }

      setRelatedProducts(relatedProductsData);
    } catch (error) {
      console.error("Error fetching related products:", error);
      // If API call fails, we'll just have an empty array
    }
  };

  /**
   * Function to fetch reviews for a product
   */
  const fetchReviews = async (productId: number) => {
    setIsLoadingReviews(true);
    try {
      const response = await reviewService.getReviewsByProductId(productId);
      if (response && response.result) {
        setReviews(response.result);
      } else if (Array.isArray(response)) {
        setReviews(response);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  /**
   * Helper function to handle API response and set product data
   */
  const handleApiResponse = (response: AxiosResponse) => {
    let productData: Product | null = null;

    // Handle different response formats
    if (response.data && response.data.result) {
      // Format: { result: { ... product data ... } }
      productData = response.data.result;
    } else if (response.data && response.data.data) {
      // Format: { data: { ... product data ... } }
      productData = response.data.data;
    } else {
      // Direct product data
      productData = response.data;
    }

    if (productData) {
      setProduct(productData);
      setSelectedImage(productData.imageUrl);

      // Set product type based on category.type
      setProductType(productData.category.type as "SACH_TRONG_NUOC" | "SACH_NUOC_NGOAI" | "VAN_PHONG_PHAM");

      fetchRelatedProducts(productData.id);
      fetchReviews(productData.id);
    }
  };

  /**
   * Function to fetch a default product when no ID is provided
   */
  const fetchDefaultProduct = async () => {
    const toastId = toast.loading("Loading default product...");
    try {
      // Try to fetch the first book from the first page
      const response = await apiService.get('/products/books/page', {
        params: {
          page: 0,
          size: 1
        }
      });

      let defaultProduct: Product | null = null;

      // Handle different response formats
      if (response.data && response.data.content && response.data.content.length > 0) {
        defaultProduct = response.data.content[0];
      } else if (response.data && response.data.result && response.data.result.content && response.data.result.content.length > 0) {
        defaultProduct = response.data.result.content[0];
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        defaultProduct = response.data[0];
      }

      if (defaultProduct) {
        setProduct(defaultProduct);
        setSelectedImage(defaultProduct.imageUrl);
        setProductType(defaultProduct.category.type as "SACH_TRONG_NUOC" | "SACH_NUOC_NGOAI" | "VAN_PHONG_PHAM");
        toast.success("Default product loaded successfully!", { id: toastId });
      } else {
        // If no books found, try to fetch an office supply
        const officeResponse = await apiService.get('/products/office-supplies/page', {
          params: {
            page: 0,
            size: 1
          }
        });

        if (officeResponse.data && officeResponse.data.content && officeResponse.data.content.length > 0) {
          defaultProduct = officeResponse.data.content[0];
        } else if (officeResponse.data && officeResponse.data.result && officeResponse.data.result.content && officeResponse.data.result.content.length > 0) {
          defaultProduct = officeResponse.data.result.content[0];
        } else if (Array.isArray(officeResponse.data) && officeResponse.data.length > 0) {
          defaultProduct = officeResponse.data[0];
        }

        if (defaultProduct) {
          setProduct(defaultProduct);
          setSelectedImage(defaultProduct.imageUrl);
          setProductType(defaultProduct.category.type as "SACH_TRONG_NUOC" | "SACH_NUOC_NGOAI" | "VAN_PHONG_PHAM");
          toast.success("Default product loaded successfully!", { id: toastId });
        } else {
          toast.error("No products found. Please add some products first.", { id: toastId });
        }
      }
    } catch (error) {
      console.error("Error fetching default product:", error);
      toast.error("Failed to fetch default product. Please try again.", { id: toastId });
    }
  };

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!product || !isLoggedIn) return;

      const storedUser = getUserResponseFromLocalStorage();
      if (!storedUser?.id) return;

      try {
        const status = await favoriteService.checkFavorite(storedUser.id, product.id);
        setIsFavorite(status);

        const count = await favoriteService.countProductFavorites(product.id);
        setFavoriteCount(count);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [product, isLoggedIn]);

  /**
   * Effect to load product data when component mounts
   * Gets the product ID from URL query parameters and fetches the corresponding product
   */
  useEffect(() => {
    // Get productId and type from URL query parameters (if any)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const type = urlParams.get('type');

    const storedUser = getUserResponseFromLocalStorage();

    if (productId) {
      // If we have a product ID, fetch the product data
      fetchProductById(productId, type || undefined);
    } else {
      // Fetch a default product if no ID provided
      console.info("No product ID provided, fetching default product");
      fetchDefaultProduct();
    }

    if (storedUser) {
      setIsLoggedIn(true);
      setUserInfo({
        username: storedUser.username || 'Người dùng',
        fullName: storedUser.full_name || 'Người dùng',
        avatar_url: storedUser.avatar_url || 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhYVcJXjU8HnMTXVmjER0yIET4AwAuHp0LO_YCiQjUsf1228qq0lYbABHFTSasYlk61e6Y-1ygAjWXFLEUTCloPcTvbAwe7nNba7SW9ot9QMce7BYus-H6eDIUvyFXh9UmAmV5eVTMultDo57c048MmDws-a65QYOzoBfUkHLv5OiMhMaUfh2WeP_3ej9du/s1600/istockphoto-1337144146-612x612.jpg',
      });
    } else {
      setIsLoggedIn(false);
      setUserInfo(null);
    }

  }, []);

  useEffect(() => {

    const storedUser = getUserResponseFromLocalStorage();

    const fetchCartInfo = async () => {
      if (!product || !storedUser?.id || !isLoggedIn) return;

      try {
        const cartData = await cartService.getCartByUserId(storedUser.id);
        const itemInCart = cartData.items?.find((item: { product_id: number; quantity: number }) => item.product_id === product.id);
        setCartQuantity(itemInCart?.quantity || 0);

        // Cập nhật số lượng tối đa có thể mua
        setMaxQuantityAvailable(product.stockQuantity - (itemInCart?.quantity || 0));
      } catch (error) {
        console.error("Error fetching cart info:", error);
        setMaxQuantityAvailable(product.stockQuantity);
      }
    };

    fetchCartInfo();
  }, [product, isLoggedIn]);

  const handleToggleFavorite = async () => {
    if (!product || processingFavorite) return;

    const storedUser = getUserResponseFromLocalStorage();
    if (!storedUser?.id) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích',
        icon: 'warning',
        confirmButtonText: 'Đăng nhập',
        confirmButtonColor: '#C92127',
        showCancelButton: true,
        cancelButtonText: 'Đóng',
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/user/login';
        }
      });
      return;
    }

    setProcessingFavorite(true);

    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(storedUser.id, product.id);
        setIsFavorite(false);
        setFavoriteCount(prev => Math.max(0, prev - 1));
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await favoriteService.addFavorite({
          userId: storedUser.id,
          productId: product.id
        });
        setIsFavorite(true);
        setFavoriteCount(prev => prev + 1);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Không thể cập nhật trạng thái yêu thích");
    } finally {
      setProcessingFavorite(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!product) return;

    const currentUser = getUserResponseFromLocalStorage();
    if (!currentUser || !currentUser.id) {
      toast.error('Không thể xác định người dùng. Vui lòng đăng nhập lại.');
      return;
    }

    try {
      await reviewService.createReview({
        productId: product.id,
        userId: currentUser.id,
        comment: reviewText,
        rating: rating
      });

      // Reset form
      setRating(5);
      setReviewText('');

      // Refresh reviews
      fetchReviews(product.id);

      toast.success('Cảm ơn bạn đã gửi đánh giá!');
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error('Không thể gửi đánh giá. Vui lòng thử lại sau.');
    }
  };

  const handleEditReview = async (reviewId: number, currentContent: string) => {
    const { value: newContent } = await Swal.fire({
      title: 'Chỉnh sửa đánh giá',
      input: 'textarea',
      inputValue: currentContent,
      inputPlaceholder: 'Nhập đánh giá mới của bạn',
      showCancelButton: true,
      confirmButtonText: 'Lưu',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#ef4444',
      inputValidator: (value) => {
        if (!value) {
          return 'Vui lòng nhập nội dung đánh giá!';
        }
        return null;
      }
    });

    if (newContent) {
      try {
        await reviewService.updateReview(reviewId, {
          content: newContent
        });

        // Refresh reviews
        fetchReviews(product!.id);
        toast.success('Đánh giá đã được cập nhật!');
      } catch (error) {
        console.error("Error updating review:", error);
        toast.error('Không thể cập nhật đánh giá. Vui lòng thử lại sau.');
      }
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    const result = await Swal.fire({
      title: 'Xóa đánh giá?',
      text: 'Bạn có chắc chắn muốn xóa đánh giá này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      try {
        await reviewService.deleteReview(reviewId);

        // Refresh reviews
        fetchReviews(product!.id);
        toast.success('Đánh giá đã được xóa!');
      } catch (error) {
        console.error("Error deleting review:", error);
        toast.error('Không thể xóa đánh giá. Vui lòng thử lại sau.');
      }
    }
  };

  const formatDate = (dateInput: string | number[]): string => {
    let date: Date;

    if (Array.isArray(dateInput)) {
      // Handle array format [year, month, day, hour, minute, second]
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
      // Note: JavaScript months are 0-indexed (0 = January, 11 = December)
      // But it looks like the input array has 1-indexed months, so we subtract 1
      date = new Date(year, month - 1, day, hour, minute, second);
    } else {
      // Handle string format
      date = new Date(dateInput);
    }

    // Return formatted date
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Thay thế hàm getUserLocation hiện tại bằng hàm sau
  const getUserLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Sử dụng Nominatim API (OpenStreetMap) - hoàn toàn miễn phí
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&addressdetails=1&accept-language=vi`
            );
            const data = await response.json();

            if (data && data.address) {
              // Lấy thông tin địa chỉ từ kết quả
              const road = data.address.road || '';
              const ward = data.address.neighbourhood || data.address.quarter || '';
              const district = data.address.city_district || data.address.district || data.address.suburb || '';
              const city = data.address.city || data.address.state || data.address.province || '';

              // Tạo chuỗi địa chỉ
              const addressParts = [road, ward, district, city].filter(Boolean);
              const formattedAddress = addressParts.length > 0
                ? addressParts.join(', ')
                : "Phường Bến Nghé, Quận 1, Hồ Chí Minh";

              setUserAddress(formattedAddress);
              localStorage.setItem('userAddress', formattedAddress);
            } else {
              throw new Error("Không thể phân tích địa chỉ");
            }
          } catch (error) {
            console.error("Không thể lấy địa chỉ từ tọa độ:", error);
            toast.error("Không thể xác định địa chỉ của bạn. Vui lòng thử lại.");
            setUserAddress("Phường Bến Nghé, Quận 1, Hồ Chí Minh");
          } finally {
            setLoadingLocation(false);
          }
        },
        (error) => {
          console.error("Lỗi định vị:", error);
          setLoadingLocation(false);

          // Hiển thị thông báo lỗi phù hợp
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              toast.error("Vui lòng cấp quyền truy cập vị trí để xác định địa chỉ của bạn.");
              break;
            case 2: // POSITION_UNAVAILABLE
              toast.error("Không thể xác định vị trí của bạn. Vui lòng thử lại sau.");
              break;
            case 3: // TIMEOUT
              toast.error("Đã hết thời gian chờ xác định vị trí. Vui lòng thử lại.");
              break;
            default:
              toast.error("Đã xảy ra lỗi khi xác định vị trí của bạn.");
          }
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setLoadingLocation(false);
      toast.error("Trình duyệt của bạn không hỗ trợ định vị.");
    }
  };

  // Hàm tính toán thời gian giao hàng
  const predictDeliveryTime = async (userAddress: string) => {
    try {
      // Chuyển đổi địa chỉ cửa hàng và người dùng thành tọa độ
      const storeAddress = "12 Nguyễn Văn Bảo, Phường 1, Gò Vấp, Hồ Chí Minh";

      // Lấy tọa độ của cửa hàng
      const storeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(storeAddress)}&limit=1`
      );
      const storeData = await storeResponse.json();

      // Lấy tọa độ của người dùng
      const userResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userAddress)}&limit=1`
      );
      const userData = await userResponse.json();

      if (!storeData.length || !userData.length) {
        return "3-5 ngày tới"; // Trả về ước tính mặc định
      }

      // Sử dụng OSRM API để tính toán thời gian
      const storeCoords = `${storeData[0].lon},${storeData[0].lat}`;
      const userCoords = `${userData[0].lon},${userData[0].lat}`;

      const routeResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${storeCoords};${userCoords}?overview=false`
      );
      const routeData = await routeResponse.json();

      if (routeData.routes && routeData.routes.length > 0) {
        // Thời gian di chuyển (giây)
        const durationInSeconds = routeData.routes[0].duration;

        // Tính toán ngày giao hàng dự kiến
        const processingTime = 24; // Giờ xử lý đơn hàng
        const durationInHours = durationInSeconds / 3600;

        // Tùy thuộc vào khoảng cách, điều chỉnh thời gian giao hàng
        let deliveryDays;
        if (durationInHours < 0.5) {
          deliveryDays = 1; // Giao hàng trong ngày nếu gần
        } else if (durationInHours < 2) {
          deliveryDays = 2; // 2 ngày nếu trong thành phố
        } else {
          deliveryDays = 3; // 3 ngày nếu xa
        }

        // Tính ngày giao hàng
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

        // Format kết quả
        const dayNames = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
        const dayOfWeek = dayNames[deliveryDate.getDay()];
        const formattedDate = `${deliveryDate.getDate().toString().padStart(2, '0')}/${(deliveryDate.getMonth() + 1).toString().padStart(2, '0')}`;

        return `${dayOfWeek} - ${formattedDate}`;
      }

      return "3-5 ngày tới"; // Mặc định
    } catch (error) {
      console.error("Lỗi khi dự đoán thời gian giao hàng:", error);
      return "3-5 ngày tới"; // Mặc định nếu có lỗi
    }
  };

  useEffect(() => {
    // Chỉ tính toán khi đã có địa chỉ người dùng
    if (userAddress && userAddress !== "Chưa rõ địa chỉ.") {
      // Bọc trong một hàm async để sử dụng await
      const fetchDeliveryDate = async () => {
        const deliveryDate = await predictDeliveryTime(userAddress);
        setEstimatedDeliveryDate(deliveryDate);
      };
      fetchDeliveryDate();
    }
  }, [userAddress]);

  useEffect(() => {
    if (product) {
      // Tạo mảng chứa tất cả ảnh và video
      const mediaItems = [
        {
          url: product.imageUrl,
          type: "image" as const
        },
        ...product.imageProducts.map(item => ({
          url: item.url,
          type: item.url.endsWith(".mp4") ? "video" as const : "image" as const
        }))
      ];
      setAllMedia(mediaItems);
    }
  }, [product]);

  // Thêm useEffect để kiểm tra chiều cao của mô tả
  useEffect(() => {
    if (descriptionRef.current) {
      // Kiểm tra xem mô tả có bị overflow không
      const isOverflow = descriptionRef.current.scrollHeight > 200; // 200px là chiều cao tối đa trước khi "Xem thêm"
      setIsDescriptionOverflow(isOverflow);
    }
  }, [product?.description]);

  // Hàm toggle hiển thị mô tả đầy đủ
  const toggleDescriptionView = () => {
    setShowFullDescription(!showFullDescription);
  };

  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Hàm thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!product) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      return;
    }
    if (quantity < 1) {
      toast.error("Số lượng phải lớn hơn 0!");
      return;
    }
    if (quantity > product.stockQuantity) {
      toast.error("Số lượng vượt quá số lượng trong kho!");
      return;
    }
    try {
      setIsAddingToCart(true);

      Swal.fire({
        title: 'Đang xử lý...',
        html: 'Vui lòng chờ trong giây lát...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await cartService.addItemToCart(user.id, {
        product_id: product.id,
        quantity: quantity,
      });

      // Show success message
      await Swal.fire({
        title: 'Thành công!',
        text: 'Đã thêm sản phẩm vào giỏ hàng',
        icon: 'success',
        confirmButtonColor: '#C92127',
        confirmButtonText: 'Xem giỏ hàng',
        showCancelButton: true,
        cancelButtonText: 'Tiếp tục mua sắm'
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = '/cart';
        }
      });

    } catch (error) {
      Swal.fire({
        title: 'Lỗi!',
        text: 'Không thể thêm vào giỏ hàng!',
        icon: 'error',
        confirmButtonColor: '#C92127',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };



  if (!product) {
    return (
      <div className="container mx-auto px-4 lg:max-w-7xl py-8">
        <div className="flex flex-col items-center justify-center">

          {/* Skeleton UI */}
          <div className="w-full mt-8 flex flex-col md:flex-row gap-6">
            {/* Left column - Image skeleton */}
            <div className="w-full md:w-2/5 bg-white rounded-lg shadow-lg p-4">
              <div className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="flex mt-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-16 bg-gray-200 animate-pulse rounded-lg"></div>
                ))}
              </div>
              <div className="flex gap-4 mt-6">
                <div className="h-10 bg-gray-200 animate-pulse rounded-lg w-1/2"></div>
                <div className="h-10 bg-red-200 animate-pulse rounded-lg w-1/2"></div>
              </div>
            </div>

            {/* Right column - Info skeletons */}
            <div className="w-full md:w-3/5">
              {/* Product info skeleton */}
              <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4 mb-4"></div>
                <div className="h-5 bg-gray-200 animate-pulse rounded w-1/2 mb-3"></div>
                <div className="h-5 bg-gray-200 animate-pulse rounded w-2/3 mb-3"></div>
                <div className="h-5 bg-gray-200 animate-pulse rounded w-1/3 mb-5"></div>
                <div className="h-8 bg-red-200 animate-pulse rounded w-1/4"></div>
              </div>

              {/* Shipping info skeleton */}
              <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4 mb-4"></div>
                <div className="h-5 bg-gray-200 animate-pulse rounded w-full mb-3"></div>
                <div className="h-5 bg-gray-200 animate-pulse rounded w-2/3 mb-3"></div>
              </div>

              {/* Product detail skeleton */}
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3 mb-4"></div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between mb-2">
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-1/4"></div>
                    <div className="h-5 bg-gray-200 animate-pulse rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:max-w-7xl">
      {/* Product Section */}
      <div className="flex flex-col bg-gray-200 p-4 md:p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:relative">
          {/* Left Column */}
          <div className="w-full md:w-2/5 md:self-start md:sticky md:top-6" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
            {/* Image Section */}
            <div className="flex flex-col items-center bg-white p-4 md:p-6 rounded-lg shadow-lg md:max-h-[calc(100vh-3rem)] md:overflow-y-auto">
              {/* Ảnh lớn */}
              <div className="w-full h-[270px] flex items-center justify-center overflow-hidden" onClick={() => openLightbox(selectedImage)}>
                {selectedImage.endsWith(".mp4") ? (
                  <video
                    src={selectedImage}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full object-contain"
                    aria-label={`Video of ${product.productName}`}
                  />
                ) : (
                  <img
                    src={selectedImage}
                    alt={product.productName}
                    className="h-full object-contain"
                    loading="eager"
                  />
                )}
              </div>

              {/* Ảnh nhỏ */}
              <div className="flex flex-nowrap overflow-x-auto overflow-y-hidden justify-start w-full bg-gray-200 p-2 rounded-lg mt-4 md:mt-6 gap-2 hide-scrollbar scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
                style={{ height: '90px', maxHeight: '90px' }} // 16 * 4.5 = 72px (md:h-16)
              >
                {/* Hiển thị `imageUrl` đầu tiên */}
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-lg border cursor-pointer flex-shrink-0 ${selectedImage === product.imageUrl ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200 hover:border-blue-300"
                    }`}
                  onMouseEnter={() => setSelectedImage(product.imageUrl)}
                  onClick={() => {
                    setSelectedImage(product.imageUrl);
                    openLightbox(product.imageUrl);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedImage(product.imageUrl);
                      openLightbox(product.imageUrl);
                    }
                  }}
                >
                  <img
                    src={product.imageUrl}
                    alt="Main Product Image"
                    loading="lazy"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>

                {/* Hiển thị video trước, sau đó là ảnh từ `imageProducts` */}
                {[
                  ...product.imageProducts.filter((item: ImageProduct) => item.url.endsWith(".mp4")),
                  ...product.imageProducts.filter((item: ImageProduct) => !item.url.endsWith(".mp4")),
                ].map((imageProduct: ImageProduct) =>
                  imageProduct.url.endsWith(".mp4") ? (
                    <div
                      key={imageProduct.id}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-lg border cursor-pointer flex-shrink-0 relative ${selectedImage === imageProduct.url ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200 hover:border-blue-300"
                        }`}
                      onMouseEnter={() => setSelectedImage(imageProduct.url)}
                      onClick={() => {
                        setSelectedImage(imageProduct.url);
                        openLightbox(imageProduct.url);
                      }}
                      aria-label={imageProduct.description || "Product video thumbnail"}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedImage(imageProduct.url);
                          openLightbox(imageProduct.url);
                        }
                      }}
                    >
                      <video
                        src={imageProduct.url}
                        preload="metadata"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={imageProduct.id}
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-lg border cursor-pointer flex-shrink-0 ${selectedImage === imageProduct.url ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200 hover:border-blue-300"
                        }`}
                      onMouseEnter={() => setSelectedImage(imageProduct.url)}
                      onClick={() => {
                        setSelectedImage(imageProduct.url);
                        openLightbox(imageProduct.url);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedImage(imageProduct.url);
                          openLightbox(imageProduct.url);
                        }
                      }}
                    >
                      <img
                        src={imageProduct.url}
                        alt={imageProduct.description || "Product image"}
                        loading="lazy"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  )
                )}
              </div>

              {lightboxOpen && (
                <div
                  className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
                  onClick={closeLightbox}
                >
                  <div className="relative max-w-4xl max-h-full w-full">
                    {/* Navigation Buttons */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateLightbox('prev');
                      }}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all z-10 cursor-pointer"
                      aria-label="Previous image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateLightbox('next');
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all z-10 cursor-pointer"
                      aria-label="Next image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Close button */}
                    <button
                      onClick={closeLightbox}
                      className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors cursor-pointer"
                      aria-label="Close lightbox"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Media content */}
                    <div
                      className="w-full h-full flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on media
                    >
                      {lightboxType === 'image' ? (
                        <img
                          src={lightboxMedia}
                          alt={product.productName}
                          className="max-w-full max-h-[70vh] mx-auto object-contain"
                        />
                      ) : (
                        <div className="bg-black rounded-lg overflow-hidden">
                          <video
                            src={lightboxMedia}
                            className="max-w-full max-h-[70vh] mx-auto"
                            controls
                            autoPlay
                            controlsList="nodownload"
                          />
                        </div>
                      )}
                    </div>

                    {/* Caption & Image counter */}
                    <div className="text-center text-white mt-4 flex flex-col">
                      <span className="text-sm mb-1">
                        {currentLightboxIndex + 1}/{allMedia.length}
                      </span>
                      <p className="truncate max-w-md mx-auto">{product.productName}</p>
                    </div>

                    {/* Thumbnail Navigation (Optional for larger screens) */}
                    <div className="hidden md:flex justify-center mt-4 gap-2 overflow-x-auto py-2 max-w-full">
                      {allMedia.map((media, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxMedia(media.url);
                            setLightboxType(media.url.endsWith('.mp4') ? 'video' : 'image');
                            setCurrentLightboxIndex(index);
                          }}
                          className={`w-12 h-12 border-2 flex-shrink-0 cursor-pointer ${lightboxMedia === media.url ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                            } transition-all rounded-md overflow-hidden focus:outline-none`}
                          aria-label={`View image ${index + 1}`}
                        >
                          {media.url.endsWith('.mp4') ? (
                            <div className="relative w-full h-full">
                              <video
                                src={media.url}
                                className="w-full h-full object-cover"
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={media.url}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 mt-6 w-full">
                <button
                  className={`border border-red-500 text-red-500 px-2 py-2 rounded-lg w-full ${isAddingToCart ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-red-50'
                    }`}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-2"></div>
                      Đang xử lý...
                    </div>
                  ) : (
                    '🛒 Thêm vào giỏ hàng'
                  )}
                </button>
                <button
                  className={`bg-red-500 px-2 py-2 rounded-lg w-full ${isAddingToCart ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-red-600 text-white'
                    }`}
                  onClick={async () => {
                    await handleAddToCart();
                    if (!isAddingToCart) {
                      window.location.href = "/cart";
                    }
                  }}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? 'Đang xử lý...' : 'Mua ngay'}
                </button>
              </div>

              {/* Details Section */}
              <div className="mt-4 rounded-lg w-full">
                <div className="flex items-center font-semibold gap-3">
                  <p>Chính sách ưu đãi của VUVISA:</p>
                </div>
                <div className="flex items-center mt-4 gap-3">
                  <Truck className="text-red-500" />
                  <p className="font-semibold">Thời gian giao hàng: <span className="font-normal">Giao nhanh và uy tín</span></p>
                </div>
                <div className="flex items-center mt-4 gap-3">
                  <RefreshCcw className="text-red-500" />
                  <p className="font-semibold">Chính sách đổi trả: <span className="font-normal">Đổi trả miễn phí toàn quốc</span></p>
                </div>
                <div className="flex items-center mt-4 gap-3">
                  <Gift className="text-red-500" />
                  <p className="font-semibold">Chính sách khách sỉ: <span className="font-normal">Ưu đãi khi mua số lượng lớn</span></p>
                </div>
              </div>



            </div>

          </div>

          {/* Right Column */}
          <div className="w-full md:w-3/5 md:flex md:flex-col">
            {/* Product Info */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
              <div className="flex justify-between items-start">
                <h1 className="text-base md:text-xl font-bold break-words">
                  {product.productName}
                </h1>

                <button
                  onClick={handleToggleFavorite}
                  disabled={processingFavorite}
                  className={`ml-2 p-2 rounded-full transition-all ${isFavorite ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:bg-gray-50'
                    } ${processingFavorite ? 'cursor-wait opacity-60' : 'cursor-pointer'}`}
                  title={isFavorite ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                >
                  {processingFavorite ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-red-500 border-r-red-500 border-b-red-500 border-l-transparent"></div>
                  ) : isFavorite ? (
                    <Heart className="h-5 w-5 fill-red-500 stroke-red-500" />
                  ) : (
                    <Heart className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Rating and Sales Info - Modern Design */}
              <div className="mt-2 flex flex-wrap gap-3">
                {/* Rating Section */}
                <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 transition-all hover:bg-gray-100">
                  <div className="flex mr-1.5">
                    {Array(5).fill(0).map((_, index) => (
                      <span
                        key={index}
                        className={`${reviews.length > 0 && index < Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
                          ? "text-yellow-400"
                          : "text-gray-300"}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-gray-600 font-medium">
                    {reviews.length > 0
                      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                      : "0"}
                  </span>
                  <span className="mx-1 text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-600">{reviews.length} đánh giá</span>
                </div>

                {/* Sales Section */}
                <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 transition-all hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mr-1.5">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  <span className="text-xs text-gray-600">Đã bán <span className="font-medium">{product.stockQuantity * 10}</span></span>
                </div>

                {/* Favorites Section */}
                <div className="flex items-center bg-gray-50 rounded-lg px-3 py-1.5 transition-all hover:bg-gray-100">
                  <Heart className="h-3.5 w-3.5 fill-red-500 stroke-red-500 mr-1.5" />
                  <span className="text-xs text-gray-600"><span className="font-medium">{favoriteCount}</span> yêu thích</span>
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-1 mt-2">

                <p className="text-gray-700 text-xs md:text-sm">
                  Nhà cung cấp: <span className="text-blue-500 cursor-pointer font-semibold">{product.supplier.supplierName}</span>
                </p>

                {isBookType(productType) && 'publisher' in product && (
                  <p className="text-gray-700 text-xs md:text-sm">
                    Nhà xuất bản: <span className="font-semibold">{product.publisher.publisherName}</span>
                  </p>
                )}

                {productType === "VAN_PHONG_PHAM" && 'classify' in product && (
                  <p className="text-gray-700 text-xs md:text-sm">
                    Phân loại: <span className="font-semibold">{product.classify}</span>
                  </p>
                )}

                {isBookType(productType) && 'authors' in product && (
                  <p className="text-gray-700 text-xs md:text-sm">
                    Tác giả: <span className="font-semibold">{product.authors.map((author: Author) => author.authorName).join(", ")}</span>
                  </p>
                )}

                <p className="text-gray-700 text-xs md:text-sm">
                  Danh mục: <span className="font-semibold">{product.category.categoryName}</span>
                </p>

              </div>

              {/* Price Section */}
              <div className="mt-3 flex flex-wrap items-center gap-2 md:gap-3">
                {(() => {
                  // Check if there are any applicable discounts
                  const today = new Date();
                  let discountedPrice = product.price;
                  let discountPercentage = 0;
                  let hasDiscount = false;

                  // Find valid discount
                  const applicableDiscount = product.discounts?.find(discount => {
                    if (!discount.startDate || !discount.endDate) return false;

                    const startDate = new Date(discount.startDate[0], discount.startDate[1] - 1, discount.startDate[2]);
                    const endDate = new Date(discount.endDate[0], discount.endDate[1] - 1, discount.endDate[2]);

                    return today >= startDate && today <= endDate;
                  });

                  // Calculate discounted price and percentage
                  if (applicableDiscount) {
                    hasDiscount = true;

                    if (applicableDiscount.discountPercentage) {
                      // Calculate price with percentage discount
                      discountedPrice = product.price * (1 - applicableDiscount.discountPercentage / 100);
                      discountPercentage = applicableDiscount.discountPercentage;
                    } else if (applicableDiscount.discountAmount) {
                      // Calculate price with amount discount
                      discountedPrice = Math.max(0, product.price - applicableDiscount.discountAmount);
                      discountPercentage = Math.round((applicableDiscount.discountAmount / product.price) * 100);
                    }

                    return (
                      <>
                        <span className="text-red-500 text-xl md:text-2xl font-semibold">
                          {Math.round(discountedPrice).toLocaleString('vi-VN')} đ
                        </span>
                        <span className="text-gray-500 line-through text-sm md:text-base">
                          {product.price.toLocaleString('vi-VN')} đ
                        </span>
                        <span className="bg-red-500 text-white px-2 py-1 text-xs rounded">
                          -{discountPercentage}%
                        </span>
                        {applicableDiscount.discountName && (
                          <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-sm">
                            {applicableDiscount.discountName}
                          </span>
                        )}
                      </>
                    );
                  } else {
                    // No discount case
                    return (
                      <span className="text-red-500 text-xl md:text-2xl font-semibold">
                        {product.price.toLocaleString('vi-VN')} đ
                      </span>
                    );
                  }
                })()}
              </div>

              {/* Availability Info */}
              <div className="mt-4 bg-blue-100 text-blue-600 p-2 rounded text-xs md:text-sm">
                Còn {product.stockQuantity} sản phẩm
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg mt-4 md:mt-6">
              <h2 className="text-base md:text-lg font-semibold">Thông tin vận chuyển</h2>
              <div className="flex flex-wrap items-center gap-1 md:gap-2 text-gray-700 mt-2 text-xs md:text-sm">
                <MapPin className="text-blue-500" size={16} />
                <p>
                  Giao hàng đến {" "}
                  <span className="font-semibold">
                    {loadingLocation ? (
                      <span className="inline-flex items-center">
                        <Loader size={12} className="animate-spin mr-1" /> Đang xác định...
                      </span>
                    ) : (
                      userAddress
                    )}
                  </span>
                  <button
                    onClick={getUserLocation}
                    className="text-blue-500 cursor-pointer ml-1 md:ml-2 block md:inline mt-1 md:mt-0 hover:underline"
                  >
                    {loadingLocation ? "Đang xác định..." : "Xác định vị trí của tôi"}
                  </button>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1 md:gap-2 text-gray-700 mt-2 text-xs md:text-sm">
                <Truck className="text-green-500" size={16} />
                <p>Giao hàng tiêu chuẩn - Dự kiến giao <span className="font-semibold">{estimatedDeliveryDate}</span></p>
              </div>

              {/* Related Offers */}
              <h2 className="text-base md:text-lg font-semibold mt-4">Ưu đãi liên quan <span className="text-blue-500 cursor-pointer text-xs md:text-sm">Xem thêm</span></h2>
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center px-2 md:px-3 py-1 bg-yellow-100 border rounded-lg text-xs md:text-sm">
                  <img className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 bg-yellow-500" src="https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/event_cart_2/ico_promotion.svg?q=10908" alt="Promotion Icon" />
                  Giảm 10%
                </div>
                <div className="flex items-center px-2 md:px-3 py-1 bg-green-100 border rounded-lg text-xs md:text-sm">
                  <img className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 bg-green-500" src="https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/event_cart_2/ico_freeship.svg?q=10908" alt="Promotion Icon" />
                  Mã freeship
                </div>
              </div>

              {/* Quantity Selector */}
              <h2 className="text-base md:text-lg font-semibold mt-4" id="quantity-label">Số lượng:</h2>
              <div className="flex items-center border border-gray-300 rounded-lg w-max mt-2" role="group" aria-labelledby="quantity-label">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className={`p-1 md:p-2 border-r border-gray-300 flex items-center justify-center cursor-pointer ${quantity <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  aria-label="Giảm số lượng"
                  type="button"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      if (value < 1) {
                        setQuantity(1);
                      } else if (value > maxQuantityAvailable) {
                        setQuantity(maxQuantityAvailable);
                        const remainMsg = cartQuantity > 0
                          ? `(Bạn đã có ${cartQuantity} sản phẩm trong giỏ hàng)`
                          : '';
                        Swal.fire({
                          title: 'Thông báo',
                          text: `Số lượng tối đa có thể mua là ${maxQuantityAvailable} ${remainMsg}`,
                          icon: 'warning',
                          confirmButtonColor: '#C92127'
                        });
                      } else {
                        setQuantity(value);
                      }
                    }
                  }}
                  className="w-12 md:w-16 text-center border-none focus:outline-none text-sm md:text-base"
                  min="1"
                  max={maxQuantityAvailable}
                  aria-label="Số lượng sản phẩm"
                />
                <button
                  onClick={() => {
                    if (quantity < maxQuantityAvailable) {
                      setQuantity(quantity + 1);
                    } else {
                      const remainMsg = cartQuantity > 0
                        ? `(Bạn đã có ${cartQuantity} sản phẩm trong giỏ hàng)`
                        : '';
                      Swal.fire({
                        title: 'Thông báo',
                        text: `Số lượng tối đa có thể mua là ${maxQuantityAvailable} ${remainMsg}`,
                        icon: 'warning',
                        confirmButtonColor: '#C92127'
                      });
                    }
                  }}
                  disabled={quantity >= maxQuantityAvailable}
                  className={`p-1 md:p-2 border-l border-gray-300 flex items-center justify-center cursor-pointer ${quantity >= maxQuantityAvailable ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  aria-label="Tăng số lượng"
                  type="button"
                >
                  <Plus size={14} />
                </button>
              </div>

              {cartQuantity > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Bạn đã có {cartQuantity} sản phẩm trong giỏ hàng
                </p>
              )}

            </div>

            {/* Product Detail */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg mt-4 md:mt-6">
              <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Thông tin chi tiết</h2>
              <div className="grid grid-cols-1 gap-3 md:gap-4">
                <DetailRow label="Mã sản phẩm" value={product.id.toString()} />
                <DetailRow label="Tên sản phẩm" value={product.productName} />
                <DetailRow label="Tên Nhà Cung Cấp" value={<a href="#" className="text-blue-500">{product.supplier.supplierName}</a>} />
                <DetailRow label="Danh mục" value={product.category.categoryName} />
                <DetailRow label="Loại danh mục" value={product.category.type} />
                <DetailRow label="Số lượng trong kho" value={product.stockQuantity.toString()} />

                {/* Book-specific details */}
                {isBookType(productType) && 'isbn' in product && (
                  <>
                    <DetailRow label="ISBN" value={product.isbn} />
                    <DetailRow label="Ngày xuất bản" value={product.publisherDate} />
                    <DetailRow label="Nhà xuất bản" value={product.publisher.publisherName} />
                    <DetailRow label="Tác giả" value={product.authors.map((author: Author) => author.authorName).join(", ")} />
                    {productType === "SACH_TRONG_NUOC" && (
                      <DetailRow label="Xuất xứ" value="Trong nước" />
                    )}
                    {productType === "SACH_NUOC_NGOAI" && (
                      <DetailRow label="Xuất xứ" value="Nước ngoài" />
                    )}
                  </>
                )}

                {/* Office supply-specific details */}
                {productType === "VAN_PHONG_PHAM" && 'classify' in product && (
                  <>
                    <DetailRow label="Phân loại" value={product.classify} />
                  </>
                )}
              </div>
              <p className="mt-3 md:mt-4 text-xs md:text-sm">
                Sản phẩm bán chạy nhất: <a href="#" className="text-blue-500">Top 100 sản phẩm bán chạy của tháng</a>
              </p>
              <p className="mt-2 text-gray-600 text-xs md:text-sm">
                Giá sản phẩm đã bao gồm thuế theo luật hiện hành. Bên cạnh đó, tùy vào loại sản phẩm, hình thức
                và địa chỉ giao hàng mà có thể phát sinh thêm chi phí khác như Phụ phí đóng gói, phí vận chuyển, phụ phí hàng cồng kềnh,...
              </p>
              <p className="mt-2 text-red-500 text-xs md:text-sm font-semibold">
                Chính sách khuyến mãi không áp dụng cho Hệ thống Nhà sách trên toàn quốc
              </p>
            </div>

            {/* Product Description */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg mt-4 md:mt-6">
              <h2 className="text-base md:text-lg font-semibold">Mô tả sản phẩm</h2>
              <h3 className="relative mt-2">
                <div
                  ref={descriptionRef}
                  className={`prose prose-sm max-w-none text-gray-700 overflow-hidden ${!showFullDescription && isDescriptionOverflow ? 'max-h-[200px]' : ''
                    }`}
                >
                  <div className="text-xs md:text-sm space-y-3 text-justify text-justify" dangerouslySetInnerHTML={{ __html: product.description || '' }} />

                  {isBookType(productType) && 'isbn' in product && (
                    <>
                      <h3 className="mt-2 font-semibold text-sm md:text-base">
                        Thông tin sách:</h3>
                      <ul className="mt-1 md:mt-2 text-gray-500 text-xs md:text-sm">
                        <li>- ISBN: {product.isbn}</li>
                        <li>- Ngày xuất bản: {product.publisherDate}</li>
                        {product.authors && product.authors.map((author: Author) => (
                          <li key={author.id}>- Tác giả: {author.authorName} - {author.description}</li>
                        ))}
                        {productType === "SACH_TRONG_NUOC" && (
                          <li>- Xuất xứ: Trong nước</li>
                        )}
                        {productType === "SACH_NUOC_NGOAI" && (
                          <li>- Xuất xứ: Nước ngoài</li>
                        )}
                      </ul>
                    </>
                  )}

                  {productType === "VAN_PHONG_PHAM" && 'classify' in product && (
                    <>
                      <h4 className="mt-3 md:mt-4 italic font-semibold text-xs md:text-sm">Thông tin sản phẩm:</h4>
                      <ul className="mt-1 md:mt-2 text-gray-500 text-xs md:text-sm">
                        <li>- Phân loại: {product.classify}</li>
                        <li>- Nhà cung cấp: {product.supplier.supplierName}</li>
                        <li>- Loại sản phẩm: Văn phòng phẩm</li>
                      </ul>
                    </>
                  )}
                </div>
              </h3>


              {/* Nút xem thêm/thu gọn chỉ hiển thị khi cần */}
              {isDescriptionOverflow && (
                <div className="mt-2 text-blue-500 cursor-pointer hover:underline text-center text-xs md:text-sm"
                  onClick={toggleDescriptionView}>
                  {showFullDescription ? 'Thu gọn' : 'Xem thêm'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Reviews */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg mt-6">
          <h2 className="font-semibold text-lg mb-3">Đánh giá sản phẩm</h2>
          <div className="flex flex-col md:flex-row items-center md:gap-10">
            <div className="flex flex-col items-center w-full md:w-1/4 mb-4 md:mb-0">
              <p className="text-4xl font-semibold">
                {reviews.length > 0
                  ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
                  : "0"}
                <span className="text-xl">/5</span>
              </p>
              <div className="flex space-x-1 mt-1">
                {Array(5).fill(0).map((_, index) => (
                  <span
                    key={index}
                    className={`text-xl ${reviews.length > 0 && index < Math.round(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length)
                      ? "text-yellow-400"
                      : "text-gray-300"}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-500 text-sm">({reviews.length} đánh giá)</p>
            </div>

            <div className="flex flex-col w-full md:w-1/4 space-y-2 mb-4 md:mb-0">
              {Array(5).fill(0).map((_, index) => {
                const starCount = 5 - index;
                const reviewsWithThisStar = reviews.filter(review => review.rating === starCount).length;
                const percentage = reviews.length > 0
                  ? (reviewsWithThisStar / reviews.length) * 100
                  : 0;

                return (
                  <div key={index} className="flex items-center">
                    <span className="w-12 text-sm">{starCount} sao</span>
                    <div className="w-32 md:w-48 h-2 bg-gray-200 rounded ml-2">
                      <div
                        className="h-full bg-yellow-400 rounded"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-500">{percentage.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>

            {isLoggedIn ? (
              <div className="w-full ml-2 md:w-2/4 bg-white rounded-lg border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold mb-4 text-base flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Viết đánh giá của bạn
                </h3>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá của bạn</label>
                    <div className="flex items-center gap-1.5 mb-1 relative group">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setRating(star)}
                          className="text-3xl focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                          aria-label={`Đánh giá ${star} sao`}
                        >
                          <span className={`${star <= rating ? "text-yellow-400" : "text-gray-300"} drop-shadow-sm transition-colors`}>
                            ★
                          </span>
                        </button>
                      ))}

                      {/* Rating description */}
                      <span className="ml-3 text-sm text-gray-600 italic min-w-[100px]">
                        {rating === 1 && "Rất tệ"}
                        {rating === 2 && "Tệ"}
                        {rating === 3 && "Bình thường"}
                        {rating === 4 && "Tốt"}
                        {rating === 5 && "Xuất sắc"}
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
                      Nội dung đánh giá
                    </label>
                    <textarea
                      id="reviewText"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[120px] focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                      placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm này..."
                      required
                      maxLength={500}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                      {reviewText.length}/500
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2.5 px-5 rounded-lg text-sm font-medium transition-all flex items-center shadow-md hover:shadow-lg cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Gửi đánh giá
                    </button>

                    <div className="text-xs text-gray-500">
                      * Đánh giá của bạn sẽ được hiển thị công khai
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <div className="w-full md:w-1/3 text-sm text-gray-700 text-center md:text-left">
                Chỉ có thành viên mới có thể viết nhận xét. Vui lòng
                <a href="/user/login" className="text-blue-500 cursor-pointer hover:underline"> đăng nhập </a>
                hoặc
                <a href="/user/register" className="text-blue-500 cursor-pointer hover:underline"> đăng ký.</a>
              </div>
            )}
          </div>

          {/* Review List Section */}
          <div className="mt-8 border-t border-gray-300 pt-4">
            <h3 className="font-semibold text-lg mb-4">Đánh giá từ khách hàng</h3>

            {isLoadingReviews ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-300 pb-4">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <img
                          src={review.user.avatar_url || 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhYVcJXjU8HnMTXVmjER0yIET4AwAuHp0LO_YCiQjUsf1228qq0lYbABHFTSasYlk61e6Y-1ygAjWXFLEUTCloPcTvbAwe7nNba7SW9ot9QMce7BYus-H6eDIUvyFXh9UmAmV5eVTMultDo57c048MmDws-a65QYOzoBfUkHLv5OiMhMaUfh2WeP_3ej9du/s1600/istockphoto-1337144146-612x612.jpg'}
                          alt={review.user.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-3">
                          <p className="font-semibold text-sm">{review.user.full_name}</p>
                          <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>

                      {/* Show edit/delete buttons only for user's own reviews */}
                      {isLoggedIn && userInfo && userInfo.username === review.user.username && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditReview(review.id, review.comment)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="Chỉnh sửa đánh giá"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Xóa đánh giá"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-2">
                      <div className="flex items-center mb-1">
                        {Array(5).fill(0).map((_, index) => (
                          <span
                            key={index}
                            className={`text-sm ${index < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm mt-1">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Chưa có đánh giá nào cho sản phẩm này.
              </div>
            )}
          </div>


        </div>

        {/* Related Products */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
                Sản phẩm tương tự
              </h2>
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={scrollLeft}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 focus:outline-none cursor-pointer"
                  disabled={scrollX >= 0}
                  aria-label="Xem sản phẩm trước"
                >
                  <ChevronLeft size={18} className={scrollX >= 0 ? "text-gray-300" : "text-gray-700"} />
                </button>
                <button
                  onClick={scrollRight}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 focus:outline-none cursor-pointer"
                  disabled={relatedProducts.length <= 4 || scrollX <= -(relatedProducts.length - 4 - 1) * 220}
                  aria-label="Xem sản phẩm tiếp theo"
                >
                  <ChevronRight size={18} className={relatedProducts.length <= 4 || scrollX <= -(relatedProducts.length - 4 - 1) * 220 ? "text-gray-300" : "text-gray-700"} />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(${scrollX}px)` }}
              >
                {relatedProducts.length > 0 ? (
                  relatedProducts.map((relProduct) => (
                    <a
                      href={`/product?id=${relProduct.id}`}
                      key={relProduct.id}
                      className="min-w-[220px] mx-2 group"
                    >
                      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="h-44 overflow-hidden relative">
                          <img
                            src={relProduct.imageUrl}
                            alt={relProduct.productName}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </div>

                        <div className="p-3">
                          <h3 className="text-sm font-medium text-gray-800 line-clamp-2 min-h-[40px] group-hover:text-red-500 transition-colors duration-200">
                            {relProduct.productName}
                          </h3>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-red-600 font-semibold">
                              {relProduct.price.toLocaleString('vi-VN')}đ
                            </span>
                            <span className="text-xs text-gray-500">
                              Còn {relProduct.stockQuantity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="w-full text-center py-8 my-4">
                    <div className="text-gray-400 mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-gray-500">Không có sản phẩm tương tự</p>
                  </div>
                )}
              </div>

              {/* Visual indicators for scroll position */}
              {relatedProducts.length > 4 && (
                <div className="flex justify-center mt-4 gap-1.5">
                  {Array.from({ length: Math.ceil(relatedProducts.length / 4) }).map((_, index) => {
                    const isActive = Math.abs(scrollX / 220) >= index * 4 && Math.abs(scrollX / 220) < (index + 1) * 4;
                    return (
                      <button
                        key={index}
                        onClick={() => setScrollX(-(index * 4 * 220))}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${isActive ? 'bg-red-500 w-4' : 'bg-gray-300'}`}
                        aria-label={`Trang ${index + 1}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile navigation */}
            <div className="flex justify-center gap-4 mt-4 md:hidden">
              <button
                onClick={() => setScrollX(Math.min(0, scrollX + 220))}
                className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md focus:outline-none"
                disabled={scrollX >= 0}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setScrollX(Math.max(-(relatedProducts.length - 1) * 220, scrollX - 220))}
                className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md focus:outline-none"
                disabled={relatedProducts.length <= 1 || scrollX <= -(relatedProducts.length - 1) * 220}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Update function for improved scrolling */}
          {/* Place this code inside the component's logic section */}
          {/*
          const [scrollX, setScrollX] = useState(0);
          
          const scrollLeft = () => {
            const newScrollX = Math.min(0, scrollX + 880);
            setScrollX(newScrollX);
          };
          
          const scrollRight = () => {
            const newScrollX = Math.max(
              -(Math.ceil(relatedProducts.length / 4) * 880 - 880),
              scrollX - 880
            );
            setScrollX(newScrollX);
          };
          
          // Optional: Auto-scroll functionality
          useEffect(() => {
            if (relatedProducts.length <= 4) return;
            
            const autoScrollTimer = setInterval(() => {
              setScrollX(prev => {
                const min = -(Math.ceil(relatedProducts.length / 4) * 880 - 880);
                if (prev <= min) return 0;
                return prev - 880;
              });
            }, 5000);
            
            return () => clearInterval(autoScrollTimer);
          }, [relatedProducts.length]);
          */}
        </div>

      </div>
    </div>
  );
};

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => {
  return (
    <div className="flex justify-between border-b border-gray-200 py-1 md:py-2">
      <span className="text-gray-600 text-xs md:text-sm">{label}</span>
      <span className="text-gray-900 font-medium text-xs md:text-sm max-w-[60%] text-right break-words">{value}</span>
    </div>
  );
};

export default Product;
