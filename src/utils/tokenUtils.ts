export const getToken = (parsed: boolean = false): string | object | null => {
  const hostTokenKey = "token";
  const token = localStorage.getItem(hostTokenKey);
  return parsed ? (token ? JSON.parse(token) : {}) : token;
};

export const setToken = (tokenData: string): void => {
  localStorage.setItem("token", tokenData);
};

export const removeToken = (): void => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  // localStorage.removeItem("refreshToken");
};

export const parseJwt = (token: string): Record<string, unknown> => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid JWT token", error);
    return {};
  }
};

export const getAuthHeader = (): Record<string, string> => {
  const token = getToken() as string;
  
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = parseJwt(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp ? (decoded.exp as number) < currentTime : true;
  } catch (error) {
    return true;
  }
};

export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = parseJwt(token);
    return decoded.exp ? new Date((decoded.exp as number) * 1000) : null;
  } catch (error) {
    return null;
  }
};
