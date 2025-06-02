import React from 'react';
import { Link } from 'react-router-dom';

interface TestCase {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  tags: string[];
}

const TestingDashboard: React.FC = () => {
  const testCases: TestCase[] = [
    {
      id: 'rate-limiter',
      title: 'Rate Limiter Test',
      description: 'Test API: 100 requests/minute limit.',
      path: '/testing/rate-limiter',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
          <line x1="16" y1="8" x2="2" y2="22" />
          <line x1="17.5" y1="15" x2="9" y2="15" />
        </svg>
      ),
      tags: ['API', 'Security', 'Performance']
    },
    {
      id: 'rate-limiter-client',
      title: 'Rate Limiter Client Test',
      description: 'Kiểm tra giới hạn tốc độ API ở phía Client với Token Bucket Algorithm.',
      path: '/testing/rate-limiter-client',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      ),
      tags: ['API', 'Client', 'Performance', 'Queue']
    },
    {
      id: 'retry-test',
      title: 'Retry Mechanism Test',
      description: 'Kiểm tra cơ chế thử lại tự động khi API call thất bại.',
      path: '/testing/retry',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2v6h-6"></path>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
          <path d="M3 22v-6h6"></path>
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
        </svg>
      ),
      tags: ['API', 'Resilience', 'Error Handling']
    }
  ];

  // Determine which tests are implemented
  const implementedTests = ['rate-limiter', 'rate-limiter-client', 'retry-test'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Testing Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Centralized dashboard for all system testing tools and utilities
            </p>
          </div>
          
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
            <div className="font-semibold">Environment</div>
            <div className="text-sm">Development</div>
          </div>
        </div>

        {/* Test cases grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testCases.map((test) => {
            const isImplemented = implementedTests.includes(test.id);
            
            return (
              <div key={test.id} className={`border rounded-lg overflow-hidden ${
                isImplemented ? 'border-gray-200 hover:border-blue-300' : 'border-gray-200 opacity-70'
              } transition-all`}>
                <div className="p-5">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                    isImplemented ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {test.icon}
                  </div>
                  
                  <h3 className="font-bold text-xl mb-2">{test.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm h-16">{test.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {test.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-xs px-2 py-1 rounded-full text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {isImplemented ? (
                    <Link 
                      to={test.path} 
                      className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition-colors"
                    >
                      Run Test
                    </Link>
                  ) : (
                    <button 
                      disabled
                      className="block w-full bg-gray-300 text-gray-500 py-2 rounded-md cursor-not-allowed"
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default TestingDashboard;