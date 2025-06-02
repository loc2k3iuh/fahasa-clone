import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { routes } from './routes';
import { GlobalProvider } from './Context/GlobalContext';
import apiClient from './services/apiClient';
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode
import React, { useEffect } from "react";
import {
  connectWebSocket,
  disconnectWebSocket,
} from "./socket/connectWebSocket";
function App() {
  useEffect(() => {
    document.body.classList.add("bg-[#F0F0F0]");

    let currentUser = null;
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
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }
      
    }
    // Handle browser/tab close event to mark user offline
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      debugger;
      console.log("Before unload event triggered");
      if (currentUser) {
        console.log("Window closing, marking user offline");
        // Use sendBeacon for more reliable delivery during page unload
        disconnectWebSocket(currentUser).catch((err) =>
          console.error("Error disconnecting WebSocket:", err)
        );
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify({ id: currentUser.id })], {
            type: "application/json",
          });
          navigator.sendBeacon(
            "http://localhost:9090/vuvisa/api/v1/users/disconnect-admin",
            blob
          );
        } else {
          // Fallback - less reliable during page unload
          // Sử dụng async/await trong một handler beforeunload sẽ không hoạt động đúng
          try {
            // Gửi yêu cầu đồng bộ trong trường hợp này
            const xhr = new XMLHttpRequest();
            xhr.open(
              "POST",
              "http://localhost:9090/vuvisa/api/v1/users/disconnect-admin",
              false
            ); // false = synchronous
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.send(JSON.stringify({ id: currentUser.id }));
          } catch (err) {
            console.error("Failed to mark user as offline:", err);
          }
        }
      }

      // Để hiện dialog "Bạn có chắc muốn thoát không?" (tuỳ chọn)
      // e.preventDefault();
      // e.returnValue = '';
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.body.style.backgroundColor = "";

      // Clean up event listener
      window.removeEventListener("beforeunload", handleBeforeUnload);

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
    <GlobalProvider>
      <Router>
        <Routes>
          {routes.map(({ path, element, layout, pageName }) => (
            <Route
              key={path}
              path={path}
              element={
                layout ? (
                  <Layout pageName={pageName}>
                    {element}
                  </Layout>
                ) : (
                  element
                )
              }
            />
          ))}
        </Routes>
      </Router>
    </GlobalProvider>
  );
}

export default App;
