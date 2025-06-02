export const plainTokenService = {
    getAccessToken: () => localStorage.getItem("access_token"),
    setAccessToken: (token: string) => localStorage.setItem("access_token", token),
    removeToken: () => localStorage.removeItem("access_token"),
  };