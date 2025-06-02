import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import RateLimiterService, { RateLimiterTestResult } from '../../services/rateLimiterService';

const RateLimiterTest: React.FC = () => {
  const [results, setResults] = useState<RateLimiterTestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [requestCount, setRequestCount] = useState<number>(120);
  const [useApiKey, setUseApiKey] = useState<boolean>(false);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [failureCount, setFailureCount] = useState<number>(0);
  const resultsEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of results when new results come in
  useEffect(() => {
    if (resultsEndRef.current) {
      resultsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [results]);

  // Update success/failure counts when results change
  useEffect(() => {
    const success = results.filter(r => r.success).length;
    const failure = results.length - success;
    setSuccessCount(success);
    setFailureCount(failure);
  }, [results]);

  // Run a single test
  const handleSingleTest = async () => {
    setLoading(true);
    try {
      const result = await RateLimiterService.testRateLimit(useApiKey);
      setResults(prev => [...prev, result]);
      toast.success('Test request sent successfully');
    } catch (error) {
      toast.error('Error sending test request');
    } finally {
      setLoading(false);
    }
  };

  // Run a burst test with multiple requests
  const handleBurstTest = async () => {
    if (requestCount <= 0) {
      toast.error('Please enter a valid number of requests');
      return;
    }

    setLoading(true);
    try {
      // Clear previous results
      setResults([]);

      // Show starting notification
      toast.info(`Sending ${requestCount} requests...`);

      // Start burst test
      const burstResults = await RateLimiterService.burstTest(requestCount, useApiKey);

      // Update results
      setResults(burstResults);

      // Show completion message
      const successes = burstResults.filter(r => r.success).length;
      const failures = burstResults.length - successes;
      toast.success(`Test complete: ${successes} succeeded, ${failures} hit rate limit`);
    } catch (error) {
      toast.error('Error during burst test');
    } finally {
      setLoading(false);
    }
  };

  // Clear all results
  const handleClear = () => {
    setResults([]);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Rate Limiter Test</h1>
        <p className="text-gray-700 mb-6">
          Quá 100 request / 1 phút.
        </p>

        {/* Test Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-gray-700 mb-1">Number of Requests:</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={requestCount}
              onChange={(e) => setRequestCount(parseInt(e.target.value) || 0)}
              className="px-3 py-2 border border-gray-300 rounded-md w-full"
              placeholder="Enter number of requests"
            />
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleSingleTest}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            Single Request
          </button>

          <button
            onClick={handleBurstTest}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Testing...' : `Send ${requestCount} Requests`}
          </button>

          <button
            onClick={handleClear}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            Clear Results
          </button>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Results Summary</h2>
            <div className="flex gap-4">
              <div className="bg-green-100 rounded-md p-3 flex-1">
                <div className="text-sm text-gray-600">Successful Requests</div>
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
              </div>
              <div className="bg-red-100 rounded-md p-3 flex-1">
                <div className="text-sm text-gray-600">Rate Limited (429)</div>
                <div className="text-2xl font-bold text-red-600">{failureCount}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Request Results</h2>
          <div className="overflow-y-auto max-h-96 border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr key={index} className={result.success ? 'bg-green-50' : 'bg-red-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {result.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.status || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.remainingRequests || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.success ? result.response?.message : result.error}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.response?.timestamp ? new Date(result.response.timestamp).toLocaleTimeString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div ref={resultsEndRef} />
          </div>
        </div>
      )}

    </div>
  );
};

export default RateLimiterTest;