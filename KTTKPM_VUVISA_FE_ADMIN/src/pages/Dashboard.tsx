import React, { useEffect, useState, useRef } from 'react';
import { useUserService } from '../services/useUserService';
import ComponentCard from '../components/common/ComponentCard';
import LineChartOne from '../components/charts/LineChartOne';
import { 
    getTotalProductCount, 
    getProductCountByCategory, 
    getProductCountByCategoryType,
    CategoryCount,
    CategoryTypeCount
} from '../services/productService';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const { getTotalUserCount } = useUserService();
    
    const [totalUsers, setTotalUsers] = useState(0);
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [totalProducts, setTotalProducts] = useState(0);
    const [isLoadingProduct, setIsLoadingProduct] = useState(true);
    
    // Product count details
    const [categoryProductCounts, setCategoryProductCounts] = useState<CategoryCount[]>([]);
    const [categoryTypeProductCounts, setCategoryTypeProductCounts] = useState<CategoryTypeCount[]>([]);
    const [isLoadingCategoryData, setIsLoadingCategoryData] = useState(false);
    const [showProductTooltip, setShowProductTooltip] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const productCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.title = "Admin Dashboard";
        
    }, []);

    useEffect(() => {    
        const fetchTotalUsers = async () => {
          try {
            const count = await getTotalUserCount();
            setIsLoadingUser(false);
    
            let currentCount = 0;
            const increment = Math.ceil(count / 100); // Tăng dần theo từng bước
            const interval = setInterval(() => {
              currentCount += increment;
              if (currentCount >= count) {
                currentCount = count;
                clearInterval(interval);
              }
              setTotalUsers(currentCount);
            }, 10); 
          } catch (error) {
            console.error("Failed to fetch total user count:", error);
            setIsLoadingUser(false);
          }
        };

        fetchTotalUsers();
      }, [getTotalUserCount]);    useEffect(() => {    
        const fetchTotalProducts = async () => {
            try {
                const count = await getTotalProductCount();
                setIsLoadingProduct(false);

                let currentCount = 0;
                const increment = Math.ceil(count / 100); // Tăng dần theo từng bước
                const interval = setInterval(() => {
                    currentCount += increment;
                    if (currentCount >= count) {
                        currentCount = count;
                        clearInterval(interval);
                    }
                    setTotalProducts(currentCount);
                }, 10);
            } catch (error) {
                console.error("Failed to fetch total product count:", error);
                setIsLoadingProduct(false);
            }
        };

        fetchTotalProducts();
    }, []);
    
    const handleProductCountHover = async () => {
        if (categoryProductCounts.length === 0 || categoryTypeProductCounts.length === 0) {
            setIsLoadingCategoryData(true);
            try {
                const [categoryData, categoryTypeData] = await Promise.all([
                    getProductCountByCategory(),
                    getProductCountByCategoryType()
                ]);
                setCategoryProductCounts(categoryData);
                setCategoryTypeProductCounts(categoryTypeData);
            } catch (error) {
                console.error("Failed to fetch product category data:", error);
            } finally {
                setIsLoadingCategoryData(false);
            }
        }
        setShowProductTooltip(true);
    };
    
    // Close tooltip when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setShowProductTooltip(false);
            }
        }
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Total Users</h2>
                    <p className="text-4xl font-bold">
                        {isLoadingUser ? "0" : totalUsers.toLocaleString()}
                    </p>
                </div>                <div 
                    ref={productCardRef}
                    className="bg-gray-800 p-4 rounded-lg shadow-md relative hover:ring-2 hover:ring-blue-500 hover:ring-opacity-50 transition-all duration-300"
                    onMouseEnter={handleProductCountHover}
                    onMouseLeave={() => setTimeout(() => {
                        if (!tooltipRef.current?.matches(':hover')) {
                            setShowProductTooltip(false);
                        }
                    }, 300)}
                >
                    <h2 className="text-xl font-semibold mb-2">Total Products</h2>
                    <div className="relative cursor-pointer">
                        <p className="text-4xl font-bold product-counter">
                            {isLoadingProduct ? "0" : totalProducts.toLocaleString()}
                        </p>
                        {!isLoadingProduct && (
                            <div className="flex items-center mt-1 text-xs text-blue-400 hover:text-blue-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Hover for category details</span>
                            </div>
                        )}
                    </div>
                    
                    {showProductTooltip && (
                        <div 
                            ref={tooltipRef}
                            className="absolute z-10 mt-2 w-96 bg-gray-700 rounded-lg shadow-lg p-5 border border-gray-600 product-count-tooltip fade-in"
                            style={{ top: "100%", left: "0" }}
                            onMouseEnter={() => setShowProductTooltip(true)}
                            onMouseLeave={() => setShowProductTooltip(false)}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-blue-400">Product Distribution</h3>
                                <button 
                                    onClick={() => setShowProductTooltip(false)}
                                    className="text-gray-400 hover:text-white text-xl"
                                >
                                    &times;
                                </button>
                            </div>
                            
                            {isLoadingCategoryData ? (
                                <div className="flex items-center justify-center py-6">
                                    <div className="w-6 h-6 border-4 border-t-blue-500 rounded-full animate-spin"></div>
                                    <span className="ml-2">Loading data...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-blue-300 border-b border-gray-600 pb-2 mb-3">
                                            By Category
                                        </h4>
                                        <div className="max-h-48 overflow-y-auto pr-2">
                                            {categoryProductCounts.length > 0 ? (() => {
                                                // Tính toán phần trăm một lần và đảm bảo tổng là 100%
                                                const totalCount = categoryProductCounts.reduce((sum, c) => sum + c.productCount, 0);
                                                const percentages = categoryProductCounts.map(c => 
                                                    parseFloat(((c.productCount / totalCount) * 100).toFixed(1))
                                                );
                                                
                                                // Tính tổng phần trăm sau khi làm tròn
                                                const sumPercentages = percentages.reduce((sum, p) => sum + p, 0);
                                                const diff = parseFloat((100 - sumPercentages).toFixed(1));
                                                
                                                // Điều chỉnh cho mục lớn nhất để đảm bảo tổng đúng 100%
                                                if (Math.abs(diff) > 0.01) {
                                                    const maxIndex = categoryProductCounts.findIndex(
                                                        c => c.productCount === Math.max(...categoryProductCounts.map(item => item.productCount))
                                                    );
                                                    if (maxIndex >= 0) {
                                                        percentages[maxIndex] = parseFloat((percentages[maxIndex] + diff).toFixed(1));
                                                    }
                                                }
                                                
                                                return categoryProductCounts.map((category, index) => {
                                                    const percentage = percentages[index];
                                                    
                                                    return (
                                                        <div key={index} className="category-item mb-2 p-1 rounded">
                                                            <div className="flex justify-between text-sm py-1">
                                                                <span className="text-gray-300">{category.categoryName}</span>
                                                                <span className="font-semibold">{category.productCount}</span>
                                                            </div>
                                                            <div className="flex items-center w-full">
                                                                <div className="category-progress-bar">
                                                                    <div 
                                                                        className="category-progress-fill" 
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="category-percentage">
                                                                    {percentage.toFixed(1)}%
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })() : (
                                                <p className="text-gray-400 text-center py-2">No categories found</p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-semibold text-blue-300 border-b border-gray-600 pb-2 mb-3">
                                            By Category Type
                                        </h4>
                                        <div className="max-h-40 overflow-y-auto pr-2">
                                            {categoryTypeProductCounts.length > 0 ? (() => {
                                                // Tính toán phần trăm một lần và đảm bảo tổng là 100%
                                                const totalCount = categoryTypeProductCounts.reduce((sum, c) => sum + c.productCount, 0);
                                                const percentages = categoryTypeProductCounts.map(c => 
                                                    parseFloat(((c.productCount / totalCount) * 100).toFixed(1))
                                                );
                                                
                                                // Tính tổng phần trăm sau khi làm tròn
                                                const sumPercentages = percentages.reduce((sum, p) => sum + p, 0);
                                                const diff = parseFloat((100 - sumPercentages).toFixed(1));
                                                
                                                // Điều chỉnh cho mục lớn nhất để đảm bảo tổng đúng 100%
                                                if (Math.abs(diff) > 0.01) {
                                                    const maxIndex = categoryTypeProductCounts.findIndex(
                                                        c => c.productCount === Math.max(...categoryTypeProductCounts.map(item => item.productCount))
                                                    );
                                                    if (maxIndex >= 0) {
                                                        percentages[maxIndex] = parseFloat((percentages[maxIndex] + diff).toFixed(1));
                                                    }
                                                }
                                                
                                                return categoryTypeProductCounts.map((type, index) => {
                                                    const percentage = percentages[index];
                                                    
                                                    return (
                                                        <div key={index} className="category-item mb-2 p-1 rounded">
                                                            <div className="flex justify-between text-sm py-1">
                                                                <span className="text-gray-300">{type.categoryType}</span>
                                                                <span className="font-semibold">{type.productCount}</span>
                                                            </div>
                                                            <div className="flex items-center w-full">
                                                                <div className="category-progress-bar">
                                                                    <div 
                                                                        className="category-progress-fill" 
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="category-percentage">
                                                                    {percentage.toFixed(1)}%
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })() : (
                                                <p className="text-gray-400 text-center py-2">No category types found</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
                <div className="bg-gray-800 p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Total Sales</h2>
                    <p className="text-4xl font-bold">$12,345</p>
                </div>
            </div>
            <div className="col-span-12 mt-8">
                <ComponentCard title="Line Chart 1">
                    <LineChartOne />
                </ComponentCard>
            </div>
            <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
                <ul className="space-y-4">
                    <li className="bg-gray-800 p-4 rounded-lg shadow-md">
                        <p className="text-sm text-gray-400">5 minutes ago</p>
                        <p>User <span className="font-semibold text-blue-400">John Doe</span> added a new product.</p>
                    </li>
                    <li className="bg-gray-800 p-4 rounded-lg shadow-md">
                        <p className="text-sm text-gray-400">10 minutes ago</p>
                        <p>User <span className="font-semibold text-blue-400">Jane Smith</span> updated a category.</p>
                    </li>
                    <li className="bg-gray-800 p-4 rounded-lg shadow-md">
                        <p className="text-sm text-gray-400">15 minutes ago</p>
                        <p>User <span className="font-semibold text-blue-400">Alice Johnson</span> completed a sale.</p>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
