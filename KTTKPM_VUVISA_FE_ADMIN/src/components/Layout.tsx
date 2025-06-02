import React from 'react';
import HeaderAdmin from './HeaderAdmin';
import FooterAdmin from './FooterAdmin';

const Layout: React.FC<{ children: React.ReactNode; pageName?: string }> = ({ children, pageName }) => {
  return (
    <>
      <HeaderAdmin pageName={pageName}>
        {children}
      </HeaderAdmin>
      <FooterAdmin />
    </>
  );
};

export default Layout;
