import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getProductsBySupplierIdAndCategoryName, Product } from '../../services/productService';
import { CategoryType } from '../../services/categoryService';
import { getSuppliers, Supplier } from '../../services/supplierService';

interface Category {
  id: number;
  categoryName: string;
}

interface LocationState {
  groupedCategories: {
    [key in CategoryType]: Category[];
  } | null;
  supplierId: number;
}

const CategoryWithSupplier = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const groupedCategories = locationState?.groupedCategories || null;
  const supplierId = locationState?.supplierId;
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const suppliersData = await getSuppliers();
        const found = suppliersData.find(s => s.id === supplierId);
        if (found) {
          setSelectedSupplier(found);
        }
      } catch (error) {
        console.error("Error fetching supplier:", error);
      }
    };
    if (supplierId) {
      fetchSupplier();
    }
  }, [supplierId]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (!categoryId || !supplierId) return;
        setLoading(true);
        setError(null);

        const data = await getProductsBySupplierIdAndCategoryName(
          supplierId,
          Number(categoryId),
          currentPage
        );

        if(data){
          setProducts(data.content);
          setTotalPages(data.totalPages);
        }else {
          setProducts([]);
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
  }, [categoryId, currentPage, supplierId]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleCategoryClick = (category: Category) => {
    setLoading(true);
    setCurrentPage(0);
    navigate(`/category/${category.id}/supplier/${supplierId}`, {
      state: { 
        groupedCategories: locationState?.groupedCategories,
        supplierId: supplierId
      }
    });
  };

  const handleSupplierToggle = (clickedSupplierId: number) => {
    if (clickedSupplierId === supplierId) {
      // If clicking the same supplier, go back to category view
      navigate(`/category/${categoryId}`, {
        state: { groupedCategories: locationState?.groupedCategories }
      });
    }
  };

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
            <h3 className="font-bold mb-3">NHÀ CUNG CẤP ĐÃ CHỌN</h3>
            <div className="space-y-2">
              {selectedSupplier && (
                <label className='flex items-center text-[14px] text-gray-600'>
                  <input 
                    type="checkbox" 
                    className='form-checkbox mr-2 h-4 w-4 text-blue-600' 
                    checked={true}
                    onChange={() => handleSupplierToggle(selectedSupplier.id)}
                  />
                  {selectedSupplier.supplierName}
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="bg-white p-4 mb-4 rounded-lg ml-5 flex-grow w-full">
          <img
            src="/src/assets/img/Screenshot 2025-03-06 215944.png"
            alt="Banner"
            className="h-80 w-full object-cover rounded"
          />

          <div className="flex justify-between items-center mt-5 mb-5">
            <div className="flex items-center">
              <span>Sắp xếp theo:</span>
              <select className="ml-2.5 p-2 border border-gray-300 rounded-lg">
                <option value="">Bán chạy tuần</option>
                <option value="">Bán chạy tháng</option>
              </select>
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
          ) : !loading && products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-600">Không có sản phẩm nào trong danh mục này</p>
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
                        {product.description}
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

export default CategoryWithSupplier; 
