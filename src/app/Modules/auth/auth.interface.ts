export interface IAuthResponse {
  accessToken: string
  refreshToken?: string
  id: string
  email: string
  firstName: string
  lastName: string
}

export interface ILoginResponse extends IAuthResponse {
  message: string
}

export interface ILogoutResponse {
  message: string
}

export interface IGetMeResponse {
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    role: string
  }
}

export interface IRefreshTokenAccess {
  accessToken: string
}
