import jwtDecode from "jwt-decode";

export const isJwtTokenExpired = (token: string): boolean => {
  let decoded: any = jwtDecode(token);
  return decoded.exp > Date.now();
};
