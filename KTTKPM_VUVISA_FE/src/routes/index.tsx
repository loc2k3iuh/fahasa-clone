import Home from '../pages/Home';
import UserPage from '../pages/UserPage';
import NewAddress from '../pages/NewAddress';
import Category from '../pages/categories/Category';
import SearchPage from '../pages/SearchPage';
import Cart from '../pages/cart/Cart';
import Product from '../pages/product/Product';
import NotFound from '../pages/NotFound';
import RegisterMailPage from '../pages/RegisterMailPage';
import NotAuthenticated from '../pages/NotAuthenticatedPage';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import RegisterSuccessPage from '../pages/RegisterSuccessPage';
import Authentication from '../components/Authenticate';
import ChangePassword from '../pages/ChangePassword';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import RequireAuth from '../guards/RequireAuth';
import ForgotPasswordSuccessPage from '../pages/ForgotPasswordSuccessPage';
import ChangeForgotPasswordPage from '../pages/ChangeForgotPasswordPage';
import VnpayReturn from '../pages/payment/VnpayReturn';
import AddressesPage from '../pages/AddressesPage';
import EditAddress from '../pages/EditAddress';
import AboutPage from '../pages/AboutPage';
import TermsOfService from '../pages/TermsOfService';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import ShippingPolicy from '../pages/ShippingPolicy';
import FAQ from '../pages/FAQ';
import Help from '../pages/Help';

import CategoryWithSupplier from '../pages/categories/CategoryWithSupplier';
import OrderList from '../pages/cart/OrderList';


import VoucherPage from '../pages/voucher/Voucher';
import Payment from '../pages/payment/payment';
import FavoritesPage from '../pages/favorite/Favorite';
import UserReviews from '../pages/review/Review';
import OrderSuccess from '../pages/payment/OrderSuccess';
import RateLimiterTest from '../pages/testing/RateLimiterTest';
import TestingDashboard from '../pages/testing/ListTesting';
import RateLimiterClientTest from '../pages/testing/RateLimiterClientTest';
import RetryTest from '../pages/testing/RetryTest';



export const routes = [  { path: '/', element: <Home />, layout: true },
  { path: '/about', element: <AboutPage />, layout: true },
  { path: '/terms-of-service', element: <TermsOfService />, layout: true },
  { path: '/privacy-policy', element: <PrivacyPolicy />, layout: true },
  { path: '/shipping-policy', element: <ShippingPolicy />, layout: true },
  { path: '/faq', element: <FAQ />, layout: true },
  { path: '/help', element: <Help />, layout: true },
  { path: '/user/account/address/new', element: <RequireAuth><NewAddress /></RequireAuth>, layout: true },
  { path: '/user/addresses', element: <RequireAuth><AddressesPage /></RequireAuth>, layout: true },
  { path: '/user/account/address/edit/:addressId', element: <RequireAuth><EditAddress /></RequireAuth>, layout: true },
  { path: '/user/profile', element: <RequireAuth><UserPage /></RequireAuth>, layout: true },
  { path: '/user/change-password', element: <RequireAuth><ChangePassword /></RequireAuth>, layout: true },
  { path: '/user/forgot-password/success', element: <ForgotPasswordSuccessPage />, layout: false },
  { path: '/user/forgot-password/change', element: <ChangeForgotPasswordPage />, layout: false },
  { path: '/user/forgot-password', element: <ForgotPasswordPage />, layout: false },
  { path: '/user/login', element: <LoginPage />, layout: true },
  { path: '/user/register', element: <RegisterPage />, layout: true },
  { path: '/user/register-mail', element: <RegisterMailPage />, layout: false },
  { path: '/user/register-success', element: <RegisterSuccessPage />, layout: false },
  { path: '/search', element: <SearchPage />, layout: true },
  { path: '/category', element: <Category />, layout: true },
  { path: '/cart', element: <Cart />, layout: true },
  { path: '/payment', element: <RequireAuth><Payment /></RequireAuth>, layout: true },
  { path: '/product', element: <Product />, layout: true },
  { path: '/authenticate', element: <Authentication />, layout: false },
  { path: '/unauthenticated', element: <NotAuthenticated />, layout: false },
  { path: '/payment/vnpay-return', element: <VnpayReturn />, layout: false },
  { path: '/user/orders', element: <OrderList />, layout: true },
  { path: '/user/wishlist', element: <FavoritesPage />, layout: true },
  { path: '/user/reviews', element: <UserReviews />, layout: true },
  { path: '/search', element: <SearchPage />, layout: true },
  { path: '/voucher', element: <RequireAuth><VoucherPage /></RequireAuth>, layout: true },
  { path: '/order-success', element: <OrderSuccess/>, layout: true},
  { path: '/search/:term', element: <SearchPage />, layout: true },
  { path: '/category/:categoryId', element: <Category />, layout: true },
  { path: '/category/:categoryId/supplier/:supplierId', element: <CategoryWithSupplier />, layout: true },
  { path: '/testing/rate-limiter', element: <RateLimiterTest />, layout: true },
  { path: '/testing/rate-limiter-client', element: <RateLimiterClientTest />, layout: true },
  { path: '/testing/retry', element: <RetryTest />, layout: true },
  { path: '/testing', element: <TestingDashboard />, layout: true },

  // Fallback route
  { path: '*', element: <NotFound />, layout: true },
];
