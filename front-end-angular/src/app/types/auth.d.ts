export interface TUser {
  username: string;
  email?: string;
  password: string;
  _id: string;
  __v: number;
}
export interface LoginResponse {
  user: TUser;
  token: string;
  refreshToken: string;
}
export interface LogoutResponse {
  message: string;
}

export interface SignupResponse {
  user: TUser;
  token: string;
  refreshToken: string;
}
