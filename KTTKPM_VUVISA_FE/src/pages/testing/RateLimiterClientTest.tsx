import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import rateLimitedApiClient, { RateLimitOptions } from '../../services/RateLimitedApiClient';
import rateLimitedProductService from '../../services/ProductServiceRate';

interface TestResult {
  id: number;
  status: 'success' | 'error' | 'pending';
  startTime: number;
  endTime?: number;
  duration?: number;
  error?: string;
}

const RateLimiterClientTest: React.FC = () => {
  // Configure rate limiter
  const [maxRequests, setMaxRequests] = useState<number>(10);
  const [timeWindowMs, setTimeWindowMs] = useState<number>(10000); // 10 seconds
  const [queueEnabled, setQueueEnabled] = useState<boolean>(true);
  
  // Test settings
  const [batchSize, setBatchSize] = useState<number>(20);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<any>(null);
  
  const resultEndRef = useRef<HTMLDivElement>(null);
  
  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newMetrics = rateLimitedApiClient.getMetrics();
      setMetrics(newMetrics);
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  // Scroll to bottom when new results added
  useEffect(() => {
    if (resultEndRef.current && results.length > 0) {
      resultEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results.length]);
  
  // Apply rate limiter configuration
  const applyConfig = () => {
    try {
      rateLimitedApiClient.updateOptions({
        maxRequests,
        timeWindowMs,
        queueEnabled
      });
      
      toast.success('Rate limiter configuration updated');
    } catch (error) {
      toast.error('Failed to update configuration');
      console.error(error);
    }
  };
  
  // Reset metrics
  const resetMetrics = () => {
    rateLimitedApiClient.resetMetrics();
    setResults([]);
    toast.info('Metrics and results cleared');
  };
  
  // Run a single test request
  const runSingleRequest = async () => {
    const id = results.length + 1;
    const newResult: TestResult = {
      id,
      status: 'pending',
      startTime: Date.now()
    };
    
    setResults(prev => [...prev, newResult]);
    
    try {
      const startTime = Date.now();
      await rateLimitedProductService.getNewestProducts(3);
      const endTime = Date.now();
      
      setResults(prev => prev.map(r => 
        r.id === id ? {
          ...r,
          status: 'success',
          endTime,
          duration: endTime - startTime
        } : r
      ));
      
    } catch (error: any) {
      const endTime = Date.now();
      
      setResults(prev => prev.map(r => 
        r.id === id ? {
          ...r,
          status: 'error',
          error: error.message || 'Unknown error',
          endTime,
          duration: endTime - newResult.startTime
        } : r
      ));
    }
  };
  
  // Run a batch test
  const runBatchTest = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    try {
      // Apply configuration first
      applyConfig();
      
      const startTime = Date.now();
      toast.info(`Starting batch test with ${batchSize} requests...`);
      
      // Create all requests at once
      const promises = Array(batchSize).fill(0).map((_, index) => {
        const id = results.length + index + 1;
        
        // Add pending result
        setResults(prev => [...prev, {
          id,
          status: 'pending',
          startTime: Date.now()
        }]);
        
        // Run the request
        return rateLimitedProductService.getNewestProducts(3)
          .then(response => {
            const endTime = Date.now();
            
            // Update result on success
            setResults(prev => prev.map(r => 
              r.id === id ? {
                ...r,
                status: 'success',
                endTime,
                duration: endTime - r.startTime
              } : r
            ));
            
            return { id, success: true };
          })
          .catch(error => {
            const endTime = Date.now();
            
            // Update result on error
            setResults(prev => prev.map(r => 
              r.id === id ? {
                ...r,
                status: 'error',
                error: error.message || 'Unknown error',
                endTime, 
                duration: endTime - r.startTime
              } : r
            ));
            
            return { id, success: false, error };
          });
      });
      
      // Wait for all requests to complete
      await Promise.all(promises);
      
      const endTime = Date.now();
      toast.success(`Batch test completed in ${(endTime - startTime)/1000}s`);
      
    } catch (error: any) {
      toast.error(`Test error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Rate Limiter Client Test</h1>
        <p className="text-gray-600 mb-6">
          Kiểm tra cơ chế giới hạn tốc độ API trên phía Client
        </p>
        
        {/* Configuration */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Cấu hình Rate Limiter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng request tối đa:
              </label>
              <input
                type="number"
                min="1"
                value={maxRequests}
                onChange={(e) => setMaxRequests(parseInt(e.target.value) || 10)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian cửa sổ (ms):
              </label>
              <input
                type="number"
                min="1000"
                step="1000"
                value={timeWindowMs}
                onChange={(e) => setTimeWindowMs(parseInt(e.target.value) || 10000)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={queueEnabled}
                  onChange={(e) => setQueueEnabled(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Cho phép hàng đợi</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              onClick={applyConfig}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
            >
              Áp dụng cấu hình
            </button>
          </div>
        </div>
        
        {/* Metrics */}
        {metrics && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold mb-3">Trạng thái hiện tại</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded shadow-sm">
                <div className="text-sm font-medium text-gray-500">Tokens khả dụng</div>
                <div className="text-xl font-bold">
                  {metrics.availableTokens.toFixed(1)} / {metrics.maxTokens}
                </div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <div className="text-sm font-medium text-gray-500">Tốc độ nạp</div>
                <div className="text-xl font-bold">
                  {metrics.refillRatePerSecond.toFixed(1)} req/s
                </div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <div className="text-sm font-medium text-gray-500">Hàng đợi</div>
                <div className="text-xl font-bold">
                  {metrics.queueLength} requests
                </div>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <div className="text-sm font-medium text-gray-500">Requests</div>
                <div className="text-xl font-bold">
                  {metrics.completedRequests} / {metrics.totalRequests}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tests */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Chạy kiểm thử</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng request trong loạt:
              </label>
              <input
                type="number"
                min="1"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value) || 1)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <div className="flex items-end gap-2">
              <button
                onClick={runSingleRequest}
                disabled={isRunning}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400 cursor-pointer"
              >
                Gửi 1 request
              </button>
              <button
                onClick={runBatchTest}
                disabled={isRunning}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:bg-gray-400 cursor-pointer"
              >
                {isRunning ? 'Đang chạy...' : `Gửi ${batchSize} requests`}
              </button>
              <button
                onClick={resetMetrics}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="mt-8">
          <div className="flex justify-between mb-2">
            <h2 className="text-lg font-semibold">Kết quả ({results.length})</h2>
            <div className="text-sm">
              <span className="text-green-600 font-medium">
                {results.filter(r => r.status === 'success').length} thành công
              </span> | 
              <span className="text-red-600 font-medium">
                {results.filter(r => r.status === 'error').length} lỗi
              </span> | 
              <span className="text-blue-600 font-medium">
                {results.filter(r => r.status === 'pending').length} đang chờ
              </span>
            </div>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                        Chưa có kết quả
                      </td>
                    </tr>
                  ) : (
                    results.map(result => (
                      <tr key={result.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {result.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              result.status === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : result.status === 'error' 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {result.status === 'success' 
                              ? 'Thành công' 
                              : result.status === 'error' 
                              ? 'Lỗi' 
                              : 'Đang chờ'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {result.duration ? `${result.duration} ms` : '...'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {result.error || (result.status === 'success' ? 'OK' : '...')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div ref={resultEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimiterClientTest;