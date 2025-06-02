import React from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatIcon from './ChatIcon';


const Layout: React.FC<{ children: React.ReactNode ; pageName?: string }> = ({ children, pageName }) => {

  return (
    <>
      
        <>          <Header />
          <main className="flex-grow bg-[#f0f0f0]">
            {children}
          </main>
          <Footer />
          <ChatIcon />
        </>
      
    </>
  );
};

export default Layout;