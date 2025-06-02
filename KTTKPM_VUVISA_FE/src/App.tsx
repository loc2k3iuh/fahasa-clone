import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode
import apiClient from "./services/apiService"; // Import your API client
import { connectWebSocket, disconnectWebSocket, onAccountDisabled } from "./socket/connectWebSocket";
import axios from "axios";
import { routes } from "./routes";
import ChatIcon from "./components/ChatIcon";
import AccountDisabledModal from "./components/AccountDisabledModal";
import { UserResponse } from "./types/user";

function App() {
  const [showDisabledModal, setShowDisabledModal] = useState(false);
  useEffect(() => {
    document.body.classList.add("bg-[#F0F0F0]");

    let currentUser = null;
    let unsubscribeDisableFn: (() => void) | null = null;
    const token = localStorage.getItem("access_token");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const decodedToken = jwtDecode(token); // Decode JWT to get user info
      const isTokenExpired = decodedToken.exp
        ? decodedToken.exp * 1000 < Date.now()
        : true;
      if (isTokenExpired) {
        apiClient.get('/users/auth/ping'); 
      }
      // Connect to WebSocket if user is logged in and token is valid
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          currentUser = user;
          console.log("Connecting to WebSocket with user:", user);
          
          // Đặt trạng thái người dùng thành online và kết nối WebSocket
          connectWebSocket(user)
            .then(() => console.log("WebSocket connected and user is online"))
            .catch((err) =>
              console.error("WebSocket or online status error:", err)
            );
            
          // Đăng ký lắng nghe sự kiện vô hiệu hóa tài khoản
          unsubscribeDisableFn = onAccountDisabled((disabledUser: UserResponse) => {
            console.log("Account disabled event received:", disabledUser);
            if(disabledUser.is_active === false) {
              setShowDisabledModal(true);
            }
          });
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
    
    // Handle browser/tab close event to mark user offline
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentUser) {
        console.log("Window closing, marking user offline");
        // Use sendBeacon for more reliable delivery during page unload
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify({ id: currentUser.id })], {
            type: "application/json",
          });
          disconnectWebSocket(currentUser).catch((err) =>
            console.error("Error disconnecting WebSocket:", err)
          );
          navigator.sendBeacon(
            "http://localhost:9090/vuvisa/api/v1/users/disconnect-user",
            blob
          );
        } else {
          // Fallback - less reliable during page unload
          try {
            // Gửi yêu cầu đồng bộ trong trường hợp này
            const xhr = new XMLHttpRequest();
            xhr.open(
              "POST",
              "http://localhost:9090/vuvisa/api/v1/users/disconnect-user",
              false
            ); // false = synchronous
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify({ id: currentUser.id }));
          } catch (err) {
            console.error("Failed to mark user as offline:", err);
          }
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      document.body.style.backgroundColor = "";

      // Clean up event listener
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Cleanup event handler for disabled account
      if (unsubscribeDisableFn) {
        unsubscribeDisableFn();
      }

      // If user is logged in, mark as offline and disconnect WebSocket
      if (currentUser) {
        // Handle cleanup systematically
        const cleanupPromises = [
          disconnectWebSocket(currentUser).catch((err) =>
            console.error("Error disconnecting WebSocket:", err)
          ),
        ];

        // Wait for all cleanup operations to complete
        Promise.all(cleanupPromises)
          .then(() => console.log("User status cleanup complete"))
          .catch((err) => console.error("Error during cleanup:", err));
      }
    };
    
    return () => {
      document.body.style.backgroundColor = "";

      // Clean up event listener
      window.removeEventListener("beforeunload", handleBeforeUnload);
      
      // Cleanup event handler for disabled account
      if (unsubscribeDisableFn) {
        unsubscribeDisableFn();
      }

      // If user is logged in, mark as offline and disconnect WebSocket
      if (currentUser) {
        // Handle cleanup systematically
        const cleanupPromises = [
          disconnectWebSocket(currentUser).catch((err) =>
            console.error("Error disconnecting WebSocket:", err)
          ),
        ];

        // Wait for all cleanup operations to complete
        Promise.all(cleanupPromises)
          .then(() => console.log("User status cleanup complete"))
          .catch((err) => console.error("Error during cleanup:", err));
      }
    };
  }, []);
  return (
    <>
      <Router>
        <Routes>
          {routes.map(({ path, element, layout }) => {
            const token = localStorage.getItem("access_token");

            // Redirect logged-in users away from /login or /register
            if ((path === "/login" || path === "/register") && token) {
              return (
                <Route key={path} path={path} element={<RedirectToHome />} />
              );
            }

            return (
              <Route
                key={path}
                path={path}
                element={layout ? <Layout>{element}</Layout> : element}
              />
            );
          })}
        </Routes>
        {/* Add ChatIcon for logged in users */}
        {localStorage.getItem("access_token") && <ChatIcon />}
        
        {/* Modal hiển thị khi tài khoản bị vô hiệu hóa - đã chuyển vào trong Router */}
        {showDisabledModal && (
          <AccountDisabledModal onClose={() => setShowDisabledModal(false)} />
        )}
      </Router>
    </>
  );
}

const RedirectToHome = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/");
  }, [navigate]);
  return null;
};

export default App;
