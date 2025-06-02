import React from 'react';

const NotFound: React.FC = () => {

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-lg mb-6">The page you are looking for does not exist.</p>
            <a
                href="/admin"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Go Back to Dashboard
            </a>
        </div>
    );
};

export default NotFound;
