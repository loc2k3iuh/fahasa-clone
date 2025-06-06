import React, { useState, useEffect, useRef } from "react";
import { UserResponse } from "../types/user";
import vuvisaLogo from "/logo_v2.png";
import vuvisaLogo_v3 from "/logo_v3.png";
import vuvisaLogo_v4 from "/logo_v4.png";
import { useUserService } from "../services/useUserService";
import { toast } from "sonner";
import { useTokenService } from "../services/useTokenService";
import { disconnectWebSocket } from "../socket/connectWebSocket";
import "../pages/custom.css";

interface HeaderAdminProps {
  children?: React.ReactNode;
  pageName?: string; // Add pageName prop
}

const menuItems = [
  {
    slug: "/admin",
    pageName: "dashboard",
    type: "dashboard",
    label: "Dashboard",
    svg: (
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5.5 3.25C4.25736 3.25 3.25 4.25736 3.25 5.5V8.99998C3.25 10.2426 4.25736 11.25 5.5 11.25H9C10.2426 11.25 11.25 10.2426 11.25 8.99998V5.5C11.25 4.25736 10.2426 3.25 9 3.25H5.5ZM4.75 5.5C4.75 5.08579 5.08579 4.75 5.5 4.75H9C9.41421 4.75 9.75 5.08579 9.75 5.5V8.99998C9.75 9.41419 9.41421 9.74998 9 9.74998H5.5C5.08579 9.74998 4.75 9.41419 4.75 8.99998V5.5ZM5.5 12.75C4.25736 12.75 3.25 13.7574 3.25 15V18.5C3.25 19.7426 4.25736 20.75 5.5 20.75H9C10.2426 20.75 11.25 19.7427 11.25 18.5V15C11.25 13.7574 10.2426 12.75 9 12.75H5.5ZM4.75 15C4.75 14.5858 5.08579 14.25 5.5 14.25H9C9.41421 14.25 9.75 14.5858 9.75 15V18.5C9.75 18.9142 9.41421 19.25 9 19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5V15ZM12.75 5.5C12.75 4.25736 13.7574 3.25 15 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V8.99998C20.75 10.2426 19.7426 11.25 18.5 11.25H15C13.7574 11.25 12.75 10.2426 12.75 8.99998V5.5ZM15 4.75C14.5858 4.75 14.25 5.08579 14.25 5.5V8.99998C14.25 9.41419 14.5858 9.74998 15 9.74998H18.5C18.9142 9.74998 19.25 9.41419 19.25 8.99998V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H15ZM15 12.75C13.7574 12.75 12.75 13.7574 12.75 15V18.5C12.75 19.7426 13.7574 20.75 15 20.75H18.5C19.7426 20.75 20.75 19.7427 20.75 18.5V15C20.75 13.7574 19.7426 12.75 18.5 12.75H15ZM14.25 15C14.25 14.5858 14.5858 14.25 15 14.25H18.5C18.9142 14.25 19.25 14.5858 19.25 15V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15C14.5858 19.25 14.25 18.9142 14.25 18.5V15Z"
        fill=""
      ></path>
    ),
    subMenu: [],
  },

    {
    slug: "/admin/calendar",
    pageName: "calendar",
    type: "calendar",
    label: "Calendar",
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        width="24"
        height="24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6.75 3v1.5M17.25 3v1.5M3.75 7.5h16.5M4.5 6.75A1.5 1.5 0 016 5.25h12a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H6A1.5 1.5 0 014.5 18.75v-12z"
        />
      </svg>
    ),
    subMenu: [],
  },
  {
    slug: "/admin/products",
    pageName: "products",
    type: "products",
    label: "Products",
    svg: (
      <>
        <circle cx="5" cy="19" r="1" />
        <path d="M4 4h2v9H4z" />
        <path d="M7 2H3a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1m0 19H3V3h4Z" />
        <circle cx="12" cy="19" r="1" />
        <path d="M11 4h2v9h-2z" />
        <path d="M14 2h-4a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1m0 19h-4V3h4Z" />
        <circle cx="19" cy="19" r="1" />
        <path d="M18 4h2v9h-2z" />
        <path d="M21 2h-4a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1m0 19h-4V3h4Z" />
      </>
    ),
    subMenu: [
      {
        slug: "/admin/products",
        pageName: "products",
        label: "List Products",
      },
      {
        slug: "/admin/categories",
        pageName: "categories",
        label: "Categories",
      },
      {
        slug: "/admin/publisher",
        pageName: "publisher",
        label: "Publisher",
      },
      {
        slug: "/admin/supplier",
        pageName: "supplier",
        label: "Supplier",
      },
      {
        slug: "/admin/author",
        pageName: "author",
        label: "Author",
      },
    ],
  },
  {
    slug: "/admin/users",
    pageName: "users",
    type: "users",
    label: "Users",
    svg: (
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z"
        fill=""
      ></path>
    ),
    subMenu: [],
  },
  {
    slug: "/admin/orders",
    pageName: "orders",
    type: "orders",
    label: "Orders",
    svg: (
      <g fill="none" stroke="currentColor" stroke-width="2">
        <rect width="14" height="17" x="5" y="4" rx="2" />
        <path stroke-linecap="round" d="M9 9h6m-6 4h6m-6 4h4" />
      </g>
    ),
    subMenu: [],
  },
  {
    slug: "/admin",
    pageName: "promotion",
    type: "promotion",
    label: "Promotion",
    svg: (
      <path
        fill="currentColor"
        d="M20.04 8.71V4h-4.7L12 .69L8.71 4H4v4.71L.69 12L4 15.34v4.7h4.71L12 23.35l3.34-3.31h4.7v-4.7L23.35 12zM8.83 7.05c.98 0 1.77.79 1.77 1.78a1.77 1.77 0 0 1-1.77 1.77c-.99 0-1.78-.79-1.78-1.77c0-.99.79-1.78 1.78-1.78M15.22 17c-.98 0-1.77-.8-1.77-1.78a1.77 1.77 0 0 1 1.77-1.77c.98 0 1.78.79 1.78 1.77A1.78 1.78 0 0 1 15.22 17m-6.72.03L7 15.53L15.53 7l1.5 1.5z"
      />
    ),
    subMenu: [
      {
        slug: "/admin/discounts",
        pageName: "discount",
        label: "Discount",
      },
      {
        slug: "/admin/vouchers",
        pageName: "voucher",
        label: "Voucher",
      },
    ],
  },
  {
    slug: "/admin/review",
    pageName: "review",
    type: "review",
    label: "Review",
    svg: (
      <path
        fill="currentColor"
        d="M6 14h3.05l5-5q.225-.225.338-.513t.112-.562t-.125-.537t-.325-.488l-.9-.95q-.225-.225-.5-.337t-.575-.113q-.275 0-.562.113T11 5.95l-5 5zm7-6.075L12.075 7zM7.5 12.5v-.95l2.525-2.525l.5.45l.45.5L8.45 12.5zm3.025-3.025l.45.5l-.95-.95zm.65 4.525H18v-2h-4.825zM2 22V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18H6zm3.15-6H20V4H4v13.125zM4 16V4z"
      />
    ),
    subMenu: [],
  },
  {
    slug: "/admin/chat",
    pageName: "chat",
    type: "chat",
    label: "Chat",
    svg: (
      <path
        fill="currentColor"
        d="M12 3C6.5 3 2 6.58 2 11c0 2.15 1.05 4.08 2.7 5.5L3 20l4-1c1.55.67 3.3 1 5 1c5.5 0 10-3.58 10-8s-4.5-9-10-9m0 2c4.42 0 8 2.91 8 7s-3.58 7-8 7c-1.45 0-2.85-.3-4.08-.87L6.5 19l1.15-3.5l-.37-.25C5.86 14.09 5 12.61 5 11c0-4.09 3.58-7 8-7m5 5h-2v2h2m-4 0h-2v2h2m-4 0H7v2h2"
      />
    ),
    subMenu: [],
  },
  {
    slug: '/admin/notification',
    pageName: 'notification',
    type: 'notification',
    label: 'Notification',
    svg: (
        <g fill="none" fill-rule="evenodd"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M5 9a7 7 0 0 1 14 0v3.764l1.822 3.644A1.1 1.1 0 0 1 19.838 18h-3.964a4.002 4.002 0 0 1-7.748 0H4.162a1.1 1.1 0 0 1-.984-1.592L5 12.764zm5.268 9a2 2 0 0 0 3.464 0zM12 4a5 5 0 0 0-5 5v3.764a2 2 0 0 1-.211.894L5.619 16h12.763l-1.17-2.342a2 2 0 0 1-.212-.894V9a5 5 0 0 0-5-5"/></g>
    ),
    subMenu: []
}
];

const HeaderAdmin: React.FC<HeaderAdminProps> = ({ children, pageName }) => {
  const [isOpenNav, setIsOpenMav] = useState(false);
  const [isTempOpenNav, setIsTempOpenNav] = useState(false);
  const [user, setUser] = useState<UserResponse | null>(null);
  const { getAccessToken, removeToken } = useTokenService();
  const {
    removeUserFromLocalStorage,
    logout,
    getUserResponseFromLocalStorage,
  } = useUserService();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false); // Đóng menu khi nhấn ra ngoài

        // Tìm và đặt lại trạng thái của mũi tên
        const arrowSvg = document.querySelector(
          ".stroke-gray-500.dark\\:stroke-gray-400"
        );
        if (arrowSvg) {
          arrowSvg.classList.remove("rotate-180");
        }
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside); // Lắng nghe sự kiện nhấn chuột
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Dọn dẹp sự kiện
    };
  }, []);

  const handleLogout = async () => {
    try {
      const currentUser = getUserResponseFromLocalStorage();

      // Gọi API đăng xuất và cập nhật trạng thái offline
      if (currentUser) {
        // Cập nhật trạng thái người dùng thành offline
        await disconnectWebSocket(currentUser);
        console.log("Đã cập nhật trạng thái người dùng thành offline");
      }
      const accessToken = getAccessToken(); // Lấy access token từ localStorage
      await logout({ token: accessToken }); // Gọi logout với đối tượng LogoutDTO
      removeToken(); // Xóa token khỏi localStorage
      removeUserFromLocalStorage(); // Xóa thông tin người dùng khỏi localStorage
      toast.success("Đăng xuất thành công!");
      setTimeout(() => {
        window.location.href = "/admin/login"; // Chuyển hướng về trang đăng nhập
      }, 1000); // Chuyển hướng về trang đăng nhập
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Đăng xuất thất bại!");
    }
  };

  const handleClickNav = () => {
    setIsOpenMav((prev) => !prev);
  };

  const handleMouseEnter = () => {
    if (isOpenNav) {
      setIsTempOpenNav(true);
    }
  };

  const handleMouseLeave = () => {
    if (isOpenNav) {
      setIsTempOpenNav(false);
    }
  };

  const sidebarToggle = (): boolean => {
    return isOpenNav && !isTempOpenNav;
  };

  useEffect(() => {
    const userResponse: UserResponse | null = getUserResponseFromLocalStorage();
    if (userResponse) {
      setUser(userResponse); // Lưu thông tin người dùng vào state
    }
  }, []);

    return (
        <>
            <div className="flex h-screen overflow-hidden">
                <aside
                    className={`sidebar fixed left-0 top-0 z-9999 flex h-screen w-[290px] flex-col overflow-y-hidden border-r px-5 border-gray-800 bg-gray-900 lg:static lg:translate-x-0 duration-300 ${sidebarToggle() ? 'translate-x-0 lg:w-[90px]' : '-translate-x-full'
                        }`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="flex items-center gap-2 pt-8 sidebar-header pb-7 justify-between">
                        <a href="/admin">
                            <span className={`logo ${sidebarToggle() ? 'hidden' : ''}`}>
                                <img src={vuvisaLogo_v3} alt="Logo"></img>
                            </span>
                            <img className={`logo-icon ${sidebarToggle() ? '' : ' hidden'}`} src={vuvisaLogo_v4} alt="Logo" />
                        </a>
                    </div>
                    <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
                        <div>
                            <div>
                                <h3 className="mb-4 text-[12px] uppercase leading-[20px] text-gray-400">
                                    <span className={sidebarToggle() ? 'duration-300 lg:hidden' : ' duration-300'}>MENU</span>
                                    <svg className={`mx-auto fill-current menu-group-icon ${sidebarToggle() ? 'lg:block hidden' : 'hidden'}`} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.99915 10.2451C6.96564 10.2451 7.74915 11.0286 7.74915 11.9951V12.0051C7.74915 12.9716 6.96564 13.7551 5.99915 13.7551C5.03265 13.7551 4.24915 12.9716 4.24915 12.0051V11.9951C4.24915 11.0286 5.03265 10.2451 5.99915 10.2451ZM17.9991 10.2451C18.9656 10.2451 19.7491 11.0286 19.7491 11.9951V12.0051C19.7491 12.9716 18.9656 13.7551 17.9991 13.7551C17.0326 13.7551 16.2491 12.9716 16.2491 12.0051V11.9951C16.2491 11.0286 17.0326 10.2451 17.9991 10.2451ZM13.7491 11.9951C13.7491 11.0286 12.9656 10.2451 11.9991 10.2451C11.0326 10.2451 10.2491 11.0286 10.2491 11.9951V12.0051C10.2491 12.9716 11.0326 13.7551 11.9991 13.7551C12.9656 13.7551 13.7491 12.9716 13.7491 12.0051V11.9951Z" fill=""></path>
                                    </svg>
                                </h3>
                                <ul className="flex flex-col gap-4 mb-6">
                                    {menuItems.map((item) => {
                                        const isActiveParent = pageName === item.type || item.subMenu.some(subItem => subItem.pageName === pageName);
                                        return (
                                            <li key={item.slug}>
                                                <a
                                                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2 leading-[20px] font-medium text-[14px] leading-[20px] cursor-pointer  
                                                    ${isActiveParent ? 'bg-[rgba(70,95,255,0.12)] text-[#7592ff]' : 'text-[#d0d5dd] hover:bg-gray-800 hover:text-white'}`}
                                                    onClick={(e) => {
                                                        if (item.subMenu.length > 0) {
                                                            e.preventDefault();
                                                            const submenu = document.getElementById(`submenu-${item.slug}`);
                                                            if (submenu) {
                                                                submenu.classList.toggle('hidden');
                                                            }
                                                            const arrow = e.currentTarget.querySelector('.menu-item-arrow');
                                                            if (arrow) {
                                                                arrow.classList.toggle('rotate-180');
                                                            }
                                                        } else {
                                                            window.location.href = item.slug;
                                                        }
                                                    }}
                                                >
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={isActiveParent ? 'fill-[#7592ff]' : 'fill-[#d0d5dd]'}>
                                                        {item.svg}
                                                    </svg>
                                                    <span className={sidebarToggle() ? 'hidden' : ''}>{item.label}</span>
                                                    {item.subMenu.length > 0 && (
                                                        <svg
                                                            className={`menu-item-arrow stroke-current menu-item-arrow-inactive transition-transform duration-300 ${sidebarToggle() ? 'hidden' : ''}`}
                                                            width="20"
                                                            height="20"
                                                            viewBox="0 0 20 20"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M4.79175 7.39584L10.0001 12.6042L15.2084 7.39585" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                                                        </svg>
                                                    )}
                                                </a>
                                                {item.subMenu.length > 0 && (
                                                    <div
                                                        id={`submenu-${item.slug}`}
                                                        className={`overflow-hidden transform translate submenu-item ${item.subMenu.some(subItem => subItem.pageName === pageName) ? '' : 'hidden'}`}>
                                                        <ul className={`flex-col gap-1 mt-2 menu-dropdown pl-9 ${sidebarToggle() ? 'lg:hidden' : 'flex'}`}>
                                                            {item.subMenu.map((subItem) => (
                                                                <li key={subItem.slug}>
                                                                    <a href={subItem.slug} className={`relative flex font-medium text-[14px] leading-[20px] rounded-lg px-3 py-2 ${pageName === subItem.pageName ? 'bg-[rgba(70,95,255,0.12)] text-[#7592ff]' : 'text-[#d0d5dd] hover:bg-gray-800 hover:text-white'}`}>
                                                                        {subItem.label}
                                                                    </a>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    </div>
                </aside>
                <div className="relative flex flex-col flex-1 overflow-x-hidden overflow-y-auto bg-gray-900">
                    <header className="sticky top-0 z-99999 flex w-full lg:border-b border-gray-800 bg-gray-900">
                        <div className="flex grow flex-col items-center justify-between lg:flex-row lg:px-6">
                            <div className="flex w-full items-center justify-between gap-2 border-b px-3 py-3 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4 border-gray-800">
                                <button className="z-99999 flex h-10 w-10 items-center justify-center rounded-lg lg:h-11 lg:w-11 lg:border border-gray-800 text-gray-400 cursor-pointer" onClick={handleClickNav}>
                                    <svg className="hidden fill-current lg:block" width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z" fill=""></path>
                                    </svg>
                                    <svg className="fill-current lg:hidden block" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M3.25 6C3.25 5.58579 3.58579 5.25 4 5.25L20 5.25C20.4142 5.25 20.75 5.58579 20.75 6C20.75 6.41421 20.4142 6.75 20 6.75L4 6.75C3.58579 6.75 3.25 6.41422 3.25 6ZM3.25 18C3.25 17.5858 3.58579 17.25 4 17.25L20 17.25C20.4142 17.25 20.75 17.5858 20.75 18C20.75 18.4142 20.4142 18.75 20 18.75L4 18.75C3.58579 18.75 3.25 18.4142 3.25 18ZM4 11.25C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75L12 12.75C12.4142 12.75 12.75 12.4142 12.75 12C12.75 11.5858 12.4142 11.25 12 11.25L4 11.25Z" fill=""></path>
                                    </svg>
                                    <svg className="fill-current hidden" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill=""></path>
                                    </svg>
                                </button>
                                <a href="/admin" className="lg:hidden">
                                    <img src={vuvisaLogo} alt="Logo" className="h-auto w-[130px] md:w-[200px]"></img>
                                </a>
                                <button className="z-99999 flex h-10 w-10 items-center justify-center rounded-lg lg:hidden text-gray-400 hover:bg-gray-800">
                                    <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z" fill=""></path>
                                    </svg>
                                </button>
                                <div className="hidden lg:block">
                                    <form>
                                        <div className="relative">
                                            <span className="absolute top-1/2 left-4 -translate-y-1/2">
                                                <svg className="fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z" fill=""></path>
                                                </svg>
                                            </span>
                                            <input type="text" placeholder="Search product..." id="search-input" className="bg-dark-900 shadow-theme-xs focus:ring-brand-500/10 focus:border-brand-800 h-11 w-full rounded-lg border py-2.5 pr-14 pl-12 text-sm placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[430px] border-gray-800 bg-white/[0.03] text-white/90 placeholder:text-white/30" />

                                            <button id="search-button" className="absolute top-1/2 right-2.5 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-lg border px-[7px] py-[4.5px] text-xs -tracking-[0.2px] border-gray-800 bg-white/[0.03] text-gray-400">
                                                <span> Tìm </span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="shadow-theme-md w-full items-center justify-between gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0 lg:shadow-none hidden">
                                <div className="2xsm:gap-3 flex items-center gap-2">
                                    <div className="relative">
                                        <button className="hover:text-gray-900 relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-800 bg-gray-900 text-gray-500 transition-colors hover:bg-gray-800 hover:text-white">
                                            <span className="absolute top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-orange-400 hidden">
                                                <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75"></span>
                                            </span>
                                            <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM-r.00004 17.7085C8.0-r004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z" fill=""></path>
                                            </svg>
                                        </button>
                                        <div x-show="dropdownOpen" className="shadow-theme-lg bg-gray-900 absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border p-3 sm:w-[361px] lg:right-0 border-gray-800 hidden">
                                            <div className="mb-3 flex items-center justify-between border-b border-gray-800">
                                                <h5 className="text-lg font-semibold text-white/90">
                                                    Notification
                                                </h5>
                                                <button className="text-gray-400">
                                                    <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill=""></path>
                                                    </svg>
                                                </button>
                                            </div>
                                            <ul className="custom-scrollbar flex h-auto flex-col overflow-y-auto">
                                                <li>
                                                    <a className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-white/5" href="#">
                                                        <span className="relative z-1 block h-10 w-full max-w-10 rounded-full">
                                                            <img src="src/images/user/user-02.jpg" alt="User" className="overflow-hidden rounded-full" />
                                                            <span className="bg-success-500 absolute right-0 bottom-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white"></span>
                                                        </span>
                                                        <span className="block">
                                                            <span className="text-[14px] mb-1.5 block text-gray-500">
                                                                <span className="font-medium text-white/90">Terry Franci</span>
                                                                requests permission to change
                                                                <span className="font-medium text-white/90">Project - Nganter App</span>
                                                            </span>
                                                            <span className="text-[12px] flex items-center gap-2 text-gray-500">
                                                                <span>Project</span>
                                                                <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                                                                <span>5 min ago</span>
                                                            </span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-white/5" href="#">
                                                        <span className="relative z-1 block h-10 w-full max-w-10 rounded-full">
                                                            <img src="src/images/user/user-03.jpg" alt="User" className="overflow-hidden rounded-full" />
                                                            <span className="bg-success-500 absolute right-0 bottom-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white"></span>
                                                        </span>
                                                        <span className="block">
                                                            <span className="text-[14px] mb-1.5 block text-gray-500">
                                                                <span className="font-medium text-white/90">Alena Franci</span>
                                                                requests permission to change
                                                                <span className="font-medium text-white/90">Project - Nganter App</span>
                                                            </span>
                                                            <span className="text-[12px] flex items-center gap-2 text-gray-500">
                                                                <span>Project</span>
                                                                <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                                                                <span>8 min ago</span>
                                                            </span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-white/5" href="#">
                                                        <span className="relative z-1 block h-10 w-full max-w-10 rounded-full">
                                                            <img src="src/images/user/user-04.jpg" alt="User" className="overflow-hidden rounded-full" />
                                                            <span className="bg-success-500 absolute right-0 bottom-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white"></span>
                                                        </span>
                                                        <span className="block">
                                                            <span className="text-[14px] mb-1.5 block text-gray-500">
                                                                <span className="font-medium text-white/90">Jocelyn Kenter</span>
                                                                requests permission to change
                                                                <span className="font-medium text-white/90">Project - Nganter App</span>
                                                            </span>
                                                            <span className="text-[12px] flex items-center gap-2 text-gray-500">
                                                                <span>Project</span>
                                                                <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                                                                <span>15 min ago</span>
                                                            </span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-white/5" href="#">
                                                        <span className="relative z-1 block h-10 w-full max-w-10 rounded-full">
                                                            <img src="src/images/user/user-05.jpg" alt="User" className="overflow-hidden rounded-full" />
                                                            <span className="bg-error-500 absolute right-0 bottom-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white"></span>
                                                        </span>
                                                        <span className="block">
                                                            <span className="text-[14px] mb-1.5 block text-gray-500">
                                                                <span className="font-medium text-white/90">Brandon Philips</span>
                                                                requests permission to change
                                                                <span className="font-medium text-white/90">Project - Nganter App</span>
                                                            </span>
                                                            <span className="text-[12px] flex items-center gap-2 text-gray-500">
                                                                <span>Project</span>
                                                                <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                                                                <span>1 hr ago</span>
                                                            </span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-white/5" href="#">
                                                        <span className="relative z-1 block h-10 w-full max-w-10 rounded-full">
                                                            <img src="src/images/user/user-02.jpg" alt="User" className="overflow-hidden rounded-full" />
                                                            <span className="bg-success-500 absolute right-0 bottom-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white"></span>
                                                        </span>
                                                        <span className="block">
                                                            <span className="text-[14px] mb-1.5 block text-gray-500">
                                                                <span className="font-medium text-white/90">Terry Franci</span>
                                                                requests permission to change
                                                                <span className="font-medium text-white/90">Project - Nganter App</span>
                                                            </span>
                                                            <span className="text-[12px] flex items-center gap-2 text-gray-500">
                                                                <span>Project</span>
                                                                <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                                                                <span>5 min ago</span>
                                                            </span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-white/5" href="#">
                                                        <span className="relative z-1 block h-10 w-full max-w-10 rounded-full">
                                                            <img src="src/images/user/user-03.jpg" alt="User" className="overflow-hidden rounded-full" />
                                                            <span className="bg-success-500 absolute right-0 bottom-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white"></span>
                                                        </span>
                                                        <span className="block">
                                                            <span className="text-[14px] mb-1.5 block text-gray-500">
                                                                <span className="font-medium text-white/90">Alena Franci</span>
                                                                requests permission to change
                                                                <span className="font-medium text-white/90">Project - Nganter App</span>
                                                            </span>
                                                            <span className="text-[12px] flex items-center gap-2 text-gray-500">
                                                                <span>Project</span>
                                                                <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                                                                <span>8 min ago</span>
                                                            </span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-white/5" href="#">
                                                        <span className="relative z-1 block h-10 w-full max-w-10 rounded-full">
                                                            <img src="src/images/user/user-04.jpg" alt="User" className="overflow-hidden rounded-full" />
                                                            <span className="bg-success-500 absolute right-0 bottom-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white"></span>
                                                        </span>
                                                        <span className="block">
                                                            <span className="text-[14px] mb-1.5 block text-gray-500">
                                                                <span className="font-medium text-white/90">Jocelyn Kenter</span>
                                                                requests permission to change
                                                                <span className="font-medium text-white/90">Project - Nganter App</span>
                                                            </span>
                                                            <span className="text-[12px] flex items-center gap-2 text-gray-500">
                                                                <span>Project</span>
                                                                <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                                                                <span>15 min ago</span>
                                                            </span>
                                                        </span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-white/5" href="#">
                                                        <span className="relative z-1 block h-10 w-full max-w-10 rounded-full">
                                                            <img src="src/images/user/user-05.jpg" alt="User" className="overflow-hidden rounded-full" />
                                                            <span className="bg-error-500 absolute right-0 bottom-0 z-10 h-2.5 w-full max-w-2.5 rounded-full border-[1.5px] border-white"></span>
                                                        </span>
                                                        <span className="block">
                                                            <span className="text-[14px] mb-1.5 block text-gray-500">
                                                                <span className="font-medium text-white/90">Brandon Philips</span>
                                                                requests permission to change
                                                                <span className="font-medium text-white/90">Project - Nganter App</span>
                                                            </span>
                                                            <span className="text-[12px] flex items-center gap-2 text-gray-500">
                                                                <span>Project</span>
                                                                <span className="h-1 w-1 rounded-full bg-gray-400"></span>
                                                                <span>1 hr ago</span>
                                                            </span>
                                                        </span>
                                                    </a>
                                                </li>
                                            </ul>
                                            <a href="#" className="text-[14px] shadow-theme-xs mt-3 flex justify-center rounded-lg border p-3 font-medium border-gray-700 bg-gray-800 text-gray-400 hover:bg-white/[0.03] hover:text-gray-200">
                                                View All Notification
                                            </a>
                                        </div>
                                    </div>
                                </div>                                <div className="relative">
                                    <div 
                                        className="flex items-center text-gray-300 cursor-pointer hover:text-gray-200 transition-colors duration-200 px-2 py-1 rounded-lg" 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation(); // Ngăn sự kiện lan ra ngoài
                                            setIsMenuOpen(!isMenuOpen);
                                            
                                            // Toggle arrow rotation
                                            const arrowSvg = document.querySelector('.stroke-gray-400');
                                            if (arrowSvg) {
                                                arrowSvg.classList.toggle("rotate-180");
                                            }
                                        }}
                                    >
                                        <span className="mr-3 h-11 w-11 overflow-hidden rounded-full border-2 border-gray-700">
                                            <img src={user?.avatar_url || "https://free-demo.tailadmin.com/src/images/user/owner.jpg"} alt="User" className="h-full w-full object-cover" />
                                        </span>
                                        <span className="text-theme-sm mr-1 block font-medium"> {user?.username}</span>
                                        <svg
                                            className="stroke-gray-400 transition-transform duration-300"
                                            width="18"
                                            height="20"
                                            viewBox="0 0 18 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            ></path>
                                        </svg>
                                    </div><div
                                        id="user-dropdown"
                                        ref={menuRef}
                                        className={`${
                                            isMenuOpen ? 'block' : 'hidden'
                                          } shadow-theme-lg bg-[#1a2231] absolute right-0 mt-[17px] flex w-[280px] flex-col rounded-xl border border-gray-800 p-4 transition-all duration-300 ease-in-out`}
                                    >
                                        <div className="pb-3 border-b border-gray-800">
                                            <span className="text-theme-sm block font-medium text-gray-200">
                                                {user?.full_name}
                                            </span>
                                            <span className="text-theme-xs mt-1 block text-gray-400">
                                                {user?.email}
                                            </span>
                                        </div>
                                        <ul className="flex flex-col gap-1 border-b py-3 border-gray-800">
                                            <li>
                                                <a
                                                    href={`/admin/${user?.id}/edit`}
                                                    className="group text-theme-sm flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200"
                                                >
                                                    <svg
                                                        className="fill-gray-400 group-hover:fill-white"
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            clipRule="evenodd"
                                                            d="M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z"
                                                            fill=""
                                                        ></path>
                                                    </svg>
                                                    My Profile
                                                </a>
                                            </li>                                        </ul>
                                        <ul className="flex flex-col gap-1 border-b py-3 border-gray-800">
                                            <li>
                                                <a
                                                    href={`/admin/${user?.id}/change-password`}
                                                    className="group text-theme-sm flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200"
                                                >
                                                    <svg
                                                        className="fill-gray-400 group-hover:fill-white"
                                                        width="24"
                                                        height="24"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            clipRule="evenodd"
                                                            d="M12 2C10.067 2 8.5 3.567 8.5 5.5V8H7C5.89543 8 5 8.89543 5 10V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V10C19 8.89543 18.1046 8 17 8H15.5V5.5C15.5 3.567 13.933 2 12 2ZM10 8V5.5C10 4.67157 10.6716 4 11.5 4C12.3284 4 13 4.67157 13 5.5V8H10ZM12 17C13.1046 17 14 16.1046 14 15C14 13.8954 13.1046 13 12 13C10.8954 13 10 13.8954 10 15C10 16.1046 10.8954 17 12 17Z"
                                                            fill=""
                                                        />
                                                    </svg>
                                                    Change Password
                                                </a>
                                            </li>
                                        </ul>
                                        <button onClick={handleLogout} className="group text-theme-sm mt-3 flex items-center gap-3 rounded-lg px-4 py-2.5 font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer w-full">
                                            <svg
                                                className="fill-gray-500 group-hover:fill-gray-300"
                                                width="24"
                                                height="24"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
                                                    fill=""
                                                ></path>
                                            </svg>
                                            Sign out
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </header>
                    {children}
                </div>
            </div>
        </>
    );
};

export default HeaderAdmin;