import RequireAuth from '../guards/RequireAuth';
import NotFound from '../pages/NotFound';
import LoginAdminPage from '../pages/LoginAdminPage';
import Dashboard from '../pages/Dashboard';
import NotFoundAdmin from '../pages/NotFoundAdmin';
import ListProduct from '../pages/Products/ListProduct';
import ListCategories from '../pages/Categories/ListCategories';
import ListPublisher from '../pages/Publisher/ListPublisher';
import ListAuthor from '../pages/Authors/ListAuthor';
import ListUser from '../pages/Users/ListUser';
import EditUser from '../pages/Users/EditUser';
import ListOrder from '../pages/Orders/ListOrder';
import EditOrder from '../pages/Orders/EditOrder';
import ListReview from '../pages/Reviews/ListReview';
import ListDiscount from '../pages/Discounts/ListDiscount';
import CreateDiscount from '../pages/Discounts/CreateDiscount';
import EditDiscount from '../pages/Discounts/EditDiscount';
import ListVoucher from '../pages/Vouchers/ListVoucher';
import EditVoucher from '../pages/Vouchers/EditVoucher';
import CreateVoucher from '../pages/Vouchers/CreateVoucher';
import NotAuthenticated from '../pages/NotAuthenticatedPage';
import ChangePassword from '../pages/Users/ChangePasswordPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ForgotPasswordSuccessPage from '../pages/ForgotPasswordSuccessPage';
import CreateBook from '../pages/Products/CreateBook';
import CreateOfficeSupply from '../pages/Products/CreateOfficeSupply';
import EditBook from '../pages/Products/EditBook';
import EditOfficeSupply from '../pages/Products/EditOfficeSupply';
import ChangeForgotPasswordPage from '../pages/ChangeForgotPasswordPage';
import Authenticate from '../components/Authenticate';
import Calendar from '../pages/Calendar/Calendar';
import ListSupplier from '../pages/Supplier/ListSupplier';
import CreateNotification from '../pages/Notification/CreateNotification';

import ChatPage from '../pages/ChatPage';
export const routes = [

  // Authentication route (to handle Facebook login redirects)
  // Admin routes
  { path: '/admin/login', element: <LoginAdminPage />, layout: false, pageName: 'login' },
  { path: '/admin/authenticate', element: <Authenticate />, layout: false, pageName: 'login' },
  { path: '/admin', element: <RequireAuth><Dashboard /></RequireAuth>, layout: true, pageName: 'dashboard' },
  { path: '/admin/forgot-password', element: <ForgotPasswordPage />, layout: false, pageName: 'forgot-password' },
  { path: '/admin/forgot-password/change', element: <ChangeForgotPasswordPage />, layout: false, pageName: 'change-reset-password' },
  { path: '/admin/forgot-password/success', element: <ForgotPasswordSuccessPage />, layout: false, pageName: 'forgot-password-success' },
  { path: '/admin/products', element: <RequireAuth><ListProduct /></RequireAuth>, layout: true, pageName: 'products' },
  { path: '/admin/products/create-book', element: <CreateBook />, layout: true, pageName: 'products' },
  { path: '/admin/products/create-office-supply', element: <CreateOfficeSupply />, layout: true, pageName: 'products' },
  { path: '/admin/products/:id/edit-book', element: <EditBook />, layout: true, pageName: 'products' },
  { path: '/admin/products/:id/edit-office-supply', element: <EditOfficeSupply />, layout: true, pageName: 'products' },
  { path: '/admin/categories', element: <RequireAuth><ListCategories /></RequireAuth>, layout: true, pageName: 'categories' },
  { path: '/admin/calendar', element: <RequireAuth><Calendar /></RequireAuth>, layout: true, pageName: 'calendar' },
  { path: '/admin/publisher', element: <RequireAuth><ListPublisher /></RequireAuth>, layout: true, pageName: 'publisher' },
  { path: '/admin/supplier', element: <RequireAuth><ListSupplier /></RequireAuth>, layout: true, pageName: 'supplier' },
  { path: '/admin/author', element: <RequireAuth><ListAuthor /></RequireAuth>, layout: true, pageName: 'author' },
  { path: '/admin/users', element: <RequireAuth><ListUser /></RequireAuth>, layout: true, pageName: 'users' },
  { path: '/admin/:id/edit', element: <RequireAuth><EditUser /></RequireAuth>, layout: true, pageName: 'users' },
  { path: '/admin/:id/change-password', element: <RequireAuth><ChangePassword /></RequireAuth>, layout: true, pageName: 'change-password' },
  { path: '/admin/orders', element: <RequireAuth><ListOrder /></RequireAuth>, layout: true, pageName: 'orders' },
  { path: '/admin/orders/edit/:id', element: <RequireAuth><EditOrder /></RequireAuth>, layout: true, pageName: 'orders' },
  { path: '/admin/review', element: <RequireAuth><ListReview /></RequireAuth>, layout: true, pageName: 'review' },
  { path: '/admin/discounts', element: <RequireAuth><ListDiscount /></RequireAuth>, layout: true, pageName: 'discount' },
  { path: '/admin/discounts/create', element: <RequireAuth><CreateDiscount /></RequireAuth>, layout: true, pageName: 'discount' },
  { path: '/admin/discounts/:id/edit', element: <RequireAuth><EditDiscount /></RequireAuth>, layout: true, pageName: 'discount' },  { path: '/admin/vouchers', element: <RequireAuth><ListVoucher /></RequireAuth>, layout: true, pageName: 'voucher' },
  { path: '/admin/vouchers/create', element: <RequireAuth><CreateVoucher /></RequireAuth>, layout: true, pageName: 'voucher' },
  { path: '/admin/vouchers/:id/edit', element: <RequireAuth><EditVoucher /></RequireAuth>, layout: true, pageName: 'voucher' },
  { path: '/admin/notification', element: <RequireAuth><CreateNotification /></RequireAuth>, layout: true, pageName: 'notification' },
  { path: '/admin/chat', element: <RequireAuth><ChatPage /></RequireAuth>, layout: true, pageName: 'chat' },
  { path: '/admin/*', element: <NotFoundAdmin />, layout: true, pageName: 'notfound' },
  { path: '/admin/unauthenticated', element: <NotAuthenticated />, layout: false, pageName: 'unauthenticated' },

  // Fallback route
  { path: '*', element: <NotFound />, layout: true },
];
