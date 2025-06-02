import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  getProductsByCategory, 
  getProductByNameOrAuthorName,
  Product 
} from '../services/productService';
import { CategoryType } from '../services/categoryService';
import { getSuppliers, Supplier } from '../services/supplierService';

interface Category {
  id: number;
  categoryName: string;
}

interface LocationState {
  groupedCategories: {
    [key in CategoryType]: Category[];
  } | null;
}

const SearchPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllSuppliers, setShowAllSuppliers] = useState(false);
  const groupedCategories = locationState?.groupedCategories || null;
  const searchTerm = searchParams.get('q') || '';
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 12;

  const displayedSuppliers = showAllSuppliers ? suppliers : suppliers.slice(0, 6);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        if (searchTerm) {
          // Nếu có search term, gọi API search
          const data = await getProductByNameOrAuthorName(searchTerm, currentPage, pageSize);
          setProducts(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        } else if (categoryId) {
          // Nếu không có search term nhưng có categoryId, gọi API theo danh mục
          const data = await getProductsByCategory(Number(categoryId), currentPage, pageSize);
          setProducts(data.content);
          setTotalPages(data.totalPages);
          setTotalElements(data.totalElements);
        }
      } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
        setError('Không thể tải sản phẩm');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProducts();
  }, [categoryId, currentPage, searchTerm]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleCategoryClick = (category: Category) => {
    setCurrentPage(0);
    navigate(`/category/${category.id}`, {
      state: { groupedCategories: locationState?.groupedCategories }
    });
  };

  const handleSupplierToggle = (supplierId: number) => {
    setCurrentPage(0);
    navigate(`/category/${categoryId}/supplier/${supplierId}`, {
      state: { 
        groupedCategories: locationState?.groupedCategories,
        supplierId: supplierId
      }
    });
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      try{
        const data = await getSuppliers();
        setSuppliers(data);
      }catch(error){
        console.error("Error fetching suppliers:", error);
        setSuppliers([]);
      }
    };
    fetchSuppliers();
  }, []);

  return (
    <div className="flex flex-col bg-[#f0f0f0] min-h-screen overflow-x-auto">
      <div className="flex-grow p-4 flex justify-around ml-20 mr-20">
        {/* Bộ lọc */}
        <div className="bg-white p-6 mb-4 rounded-lg w-[280px] h-fit">
          <h2 className="text-lg font-bold mb-4">LỌC SẢN PHẨM</h2>

          <div className="border-t border-gray-200 py-4">
            <h3 className="font-bold mb-3">THỂ LOẠI</h3>
            {groupedCategories && (
              <div className="space-y-4">
                {Object.entries(groupedCategories).map(([type, categories]) => (
                  <div key={type} className="space-y-2">
                    <h4 className="font-semibold text-[15px]">
                      {type === CategoryType.VAN_PHONG_PHAM && 'Văn phòng phẩm'}
                      {type === CategoryType.SACH_NUOC_NGOAI && 'Sách nước ngoài'}
                      {type === CategoryType.SACH_TRONG_NUOC && 'Sách trong nước'}
                    </h4>
                    <ul className="space-y-2">
                      {(categories as Category[]).map((cat: Category) => (
                        <li 
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat)}
                          className={`text-[14px] cursor-pointer hover:text-gray-800 ${
                            Number(categoryId) === cat.id 
                              ? 'text-red-600 font-medium' 
                              : 'text-gray-600'
                          }`}
                        >
                          {cat.categoryName}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 py-4">
            <h3 className="font-bold mb-3">NHÀ CUNG CẤP</h3>
            <div className="space-y-2">
              {displayedSuppliers.map((supplier) => (
                <label key={supplier.id} className='flex items-center text-[14px] text-gray-600'>
                  <input 
                    type="checkbox" 
                    className='form-checkbox mr-2 h-4 w-4 text-blue-600' 
                    checked={selectedSuppliers.includes(supplier.id)}
                    onChange={() => handleSupplierToggle(supplier.id)}
                  />
                  {supplier.supplierName}
                </label>
              ))}
            </div>
            {suppliers.length > 6 && (
              <button
                className="mt-3 text-blue-600 hover:underline text-[14px]"
                onClick={() => setShowAllSuppliers(!showAllSuppliers)}
              >
                {showAllSuppliers ? "Thu gọn" : "Xem thêm"}
              </button>
            )}
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className={`bg-white p-4 mb-4 rounded-lg ${!searchTerm ? 'ml-5' : ''} flex-grow w-full`}>
          {/* Ẩn banner khi đang search */}
          {!searchTerm && (
            <img
              src="/src/assets/img/Screenshot 2025-03-06 215944.png"
              alt="Banner"
              className="h-80 w-full object-cover rounded"
            />
          )}

          <div className="flex justify-between items-center mt-5 mb-5">
            <div className="bg-blue-200 border-6 border-blue-200 rounded-lg text-blue-700 text-1xl p-2">
              {searchTerm ? (
                <>
                  Kết quả tìm kiếm cho: <span className="font-semibold">"{searchTerm}"</span>
                </>
              ) : null}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-600">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-600">
                {searchTerm 
                  ? `Không tìm thấy sản phẩm nào phù hợp với "${searchTerm}"`
                  : 'Không có sản phẩm nào trong danh mục này'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/product?id=${product.id}`)}
                  >
                    <img
                      src={product.imageUrl || '/placeholder-product.jpg'}
                      alt={product.productName}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {product.productName}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {product.description.replace(/<[^>]*>/g, '')}
                      </p>
                      <p className="text-red-600 font-bold text-lg">
                        {product.price.toLocaleString()} đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === 0
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Trước
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === index
                          ? 'bg-red-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === totalPages - 1
                        ? 'bg-gray-100 text-gray-400'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;