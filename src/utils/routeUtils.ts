import { getToken, parseJwt } from './tokenUtils';

// Route access mapping based on user roles
export const routeAccessMap: Record<string, string[]> = {
  "/super-admin": ["superadmin"],
  "/super-admin/schools": ["superadmin"],
  "/super-admin/subscriptions": ["superadmin"],
  "/super-admin/content": ["superadmin"],
  "/school-admin": ["admin", "user"],
  "/school-admin/students": ["admin", "user"],
  "/school-admin/profile": ["admin", "user"],
  "/school-admin/billing": ["admin", "user"],
  "/school-admin/content": ["admin", "user"],
};

// Check if user has access to a specific route
export const hasRouteAccess = (pathname: string, userRole: string): boolean => {
  // console.log(pathname, userRole)
  const allowedRoles = routeAccessMap[pathname];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
};

// Get user role from token
export const getUserRoleFromToken = (): string | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const decoded = parseJwt(token as string);
    return decoded.role as string || null;
  } catch (error) {
    console.error('Error parsing token for role:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

// Get user info from token
export const getUserInfoFromToken = (): { userId?: string; role?: string; exp?: number } | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const decoded = parseJwt(token as string);
    return {
      userId: decoded.userId as string,
      role: decoded.role as string,
      exp: decoded.exp as number
    };
  } catch (error) {
    console.error('Error parsing token for user info:', error);
    return null;
  }
};
