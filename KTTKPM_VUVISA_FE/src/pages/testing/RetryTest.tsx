import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import API_BASE_URL from '../../config/apiConfig';

interface RetryResult {
  id: number;
  endpoint: string;
  status: 'pending' | 'success' | 'error';
  startTime: number;
  endTime?: number;
  duration?: number;
  attempts?: number;
  failCount?: number;
  response?: any;
  error?: string;
}

const RetryTest: React.FC = () => {
  // Test configuration
  const [endpoint, setEndpoint] = useState<string>('success');
  const [failCount, setFailCount] = useState<number>(2);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<RetryResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const resultEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new results added
  useEffect(() => {
    if (resultEndRef.current && results.length > 0) {
      resultEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results.length]);
  
  // Run a test
  const runTest = async () => {
    setIsRunning(true);
    const id = results.length + 1;
    
    const newResult: RetryResult = {
      id,
      endpoint,
      status: 'pending',
      startTime: Date.now(),
      failCount: endpoint === 'simulate-failure' ? failCount : undefined
    };
    
    setResults(prev => [...prev, newResult]);
    
    let startTime = Date.now();
    try {
      setIsLoading(true);
      
      let url = `${API_BASE_URL}/retry-test/${endpoint}`;
      if (endpoint === 'simulate-failure') {
        url += `?failCount=${failCount}`;
      }
      
      startTime = Date.now();
      const response = await axios.get(url);
      const endTime = Date.now();
      
      // Update result with success
      setResults(prev => prev.map(r => 
        r.id === id ? {
          ...r,
          status: 'success',
          endTime,
          duration: endTime - startTime,
          response: response.data,
          attempts: response.data.totalAttempts || 1
        } : r
      ));
      
      toast.success(`Test thành công${response.data.totalAttempts ? ` sau ${response.data.totalAttempts} lần thử` : ''}`);
      
    } catch (error: any) {
      const endTime = Date.now();
      
      // Extract error details
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      
      // Update result with error
      setResults(prev => prev.map(r => 
        r.id === id ? {
          ...r,
          status: 'error',
          endTime,
          duration: endTime - startTime,
          error: errorMessage
        } : r
      ));
      
      toast.error(`Test thất bại: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setIsRunning(false);
    }
  };
  
  // Clear results
  const clearResults = () => {
    setResults([]);
    toast.info('Kết quả đã được xóa');
  };
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Retry Mechanism Test</h1>
        <p className="text-gray-600 mb-6">
          Kiểm tra cơ chế retry của backend khi gọi API thất bại
        </p>
        
        {/* Test Configuration */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-3">Cấu hình Test</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint:
              </label>
              <select
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                disabled={isRunning}
              >
                <option value="success">Success (Thành công ngay lần đầu)</option>
                <option value="simulate-failure">Simulate Failure (Thất bại có kiểm soát)</option>
                <option value="always-fail">Always Fail (Luôn thất bại)</option>
              </select>
            </div>
            
            {endpoint === 'simulate-failure' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lần thất bại trước khi thành công:
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={failCount}
                  onChange={(e) => setFailCount(parseInt(e.target.value) || 1)}
                  className="w-full p-2 border border-gray-300 rounded"
                  disabled={isRunning}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={runTest}
              disabled={isRunning || isLoading}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Đang chạy...' : 'Chạy Test'}
            </button>
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md cursor-pointer"
            >
              Xóa Kết Quả
            </button>
          </div>
        </div>
        
        {/* Giải thích về các endpoint */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-lg font-semibold mb-3">Giới thiệu về Retry Mechanism</h2>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium">Retry</span> là cơ chế tự động thử lại một thao tác khi nó thất bại, 
              giúp ứng dụng phục hồi từ các lỗi tạm thời mà không cần can thiệp thủ công.
            </p>
            
            <div>
              <p className="font-medium text-blue-700">Backend hỗ trợ 3 endpoint để test:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li><span className="font-medium">Success</span>: Luôn thành công ở lần gọi đầu tiên</li>
                <li><span className="font-medium">Simulate Failure</span>: Thất bại N lần theo cấu hình trước khi thành công</li>
                <li><span className="font-medium">Always Fail</span>: Luôn thất bại và dùng hết số lần retry</li>
              </ul>
            </div>
            
            <div>
              <p className="font-medium text-blue-700">Cấu hình retry ở backend:</p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Tối đa 3 lần thử lại (4 lần gọi tổng cộng)</li>
                <li>Thời gian chờ giữa các lần thử: 2-4 giây (exponential backoff)</li>
                <li>Sử dụng WebClient và Reactor Retry</li>
              </ul>
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
                {results.filter(r => r.status === 'error').length} thất bại
              </span>
            </div>
          </div>
          
          {results.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
              Chưa có kết quả test nào
            </div>
          ) : (
            results.map(result => (
              <div 
                key={result.id} 
                className={`mb-4 border rounded-lg overflow-hidden shadow-sm ${
                  result.status === 'pending' ? 'border-blue-200 bg-blue-50' :
                  result.status === 'success' ? 'border-green-200 bg-green-50' : 
                  'border-red-200 bg-red-50'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className={`inline-flex rounded-full w-3 h-3 mr-2 ${
                        result.status === 'pending' ? 'bg-blue-500' :
                        result.status === 'success' ? 'bg-green-500' : 
                        'bg-red-500'
                      }`}></span>
                      <h3 className="font-semibold">
                        Test #{result.id} - {result.endpoint === 'success' ? 'Success' : 
                         result.endpoint === 'simulate-failure' ? 'Simulate Failure' : 'Always Fail'}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-500">
                      {result.status === 'pending' ? 'Đang xử lý...' : 
                       result.duration ? `${result.duration}ms` : ''}
                    </div>
                  </div>
                  
                  {result.endpoint === 'simulate-failure' && (
                    <div className="text-sm text-gray-600 mb-2">
                      Cấu hình thất bại {result.failCount} lần trước khi thành công
                    </div>
                  )}
                  
                  {result.attempts && (
                    <div className="mb-2">
                      <div className="text-sm font-medium mb-1">Quá trình thử lại:</div>
                      <div className="flex items-center">
                        {Array.from({ length: result.attempts }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-8 h-2 mr-1 rounded-sm ${
                              i < result.attempts! - 1 ? 'bg-red-400' : 'bg-green-500'
                            }`}
                            title={`Lần thử ${i+1}: ${i < result.attempts! - 1 ? 'Thất bại' : 'Thành công'}`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    {result.status === 'pending' ? (
                      <div className="flex items-center text-blue-500">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang thực hiện...
                      </div>
                    ) : result.status === 'success' ? (
                      <>
                        <div className="font-medium text-green-700 mb-1">Kết quả:</div>
                        <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40 border border-gray-200">
                          {JSON.stringify(result.response, null, 2)}
                        </pre>
                      </>
                    ) : (
                      <>
                        <div className="font-medium text-red-700 mb-1">Lỗi:</div>
                        <div className="bg-white p-2 rounded text-xs overflow-auto max-h-40 border border-gray-200 text-red-600">
                          {result.error}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={resultEndRef} />
        </div>
      </div>
    </div>
  );
};

export default RetryTest;