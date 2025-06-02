import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUserService } from "../services/useUserService";
import { useTokenService } from "../services/useTokenService";
import { Box, CircularProgress, Typography } from "@mui/material";
import { toast } from "sonner";
import { FacebookUserRequest } from "../types/user";
import { connectWebSocket } from "../socket/connectWebSocket";

const Authentication: React.FC = () =>  {
  const navigate = useNavigate();
  const [isLoggedin, setIsLoggedin] = useState(false);
  const {
    outboundAuthenticationUser,
    facebookAuthenticationUser,
    getUserDetail,
    saveUserResponseToLocalStorage,
  } = useUserService();
  const { setAccessToken, removeToken } = useTokenService();

  useEffect(() => { 
    console.log(window.location.href);
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const provider = urlParams.get('provider') || 'google'; // Default to Google if not specified

    if (!authCode) {
      toast.error("Authentication failed. No authentication code found.");
      navigate("/login");
      return;
    }
   
    // Sử dụng IIFE để xử lý async/await
    (async () => {
      try {
        let accessToken;
        
        if (provider === 'facebook') {
          // Facebook authentication
          try {
            // Decode the base64 encoded Facebook data
            const fbDataString = atob(authCode);
            const facebookUserData: FacebookUserRequest = JSON.parse(fbDataString);
            
            // Call the backend with the Facebook user data
            const response = await facebookAuthenticationUser(facebookUserData);
            accessToken = response.accessToken;
          } catch (error) {
            console.error("Facebook data parsing error:", error);
            throw new Error("Invalid Facebook authentication data");
          }
        } else {
          // Google authentication (default)
          const response = await outboundAuthenticationUser(authCode);
          accessToken = response.accessToken;
        }
        
        setAccessToken(accessToken);
    
        const user = await getUserDetail();

        // Kiểm tra quyền USER
        const isUser = user.roles?.some(
          (role: { name: string }) => role.name === "USER"
        );

        if (!isUser) {
          toast.error("You don't have user privileges!");
          removeToken();
          navigate("/user/login");
          return;
        }

        // Lưu thông tin user vào localStorage
        saveUserResponseToLocalStorage(user);

        // Connect to WebSocket
        await connectWebSocket(user);

        toast.success("Sign in successfully!");
        setIsLoggedin(true);
      } catch (error) {
        console.error("Authentication failed:", error);
        toast.error("Authentication failed. Please try again.");
        navigate("/user/login");
      }
    })();
  }, []);

  useEffect(() => {
    if (isLoggedin) {
      navigate("/");
    }
  }, [isLoggedin, navigate]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "30px",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress></CircularProgress>
        <Typography>Authenticating...</Typography>
      </Box>
    </>
  );
}

export default Authentication;