import request from "@utils/request";
import { responseType } from "@utils/type";

export let getApi: { [key: string]: string } = {
  Loginapi: "/userServer/login/account",
  refreshTokenapi: "userServer/login/refresh",
};

// 登录表单类型
export interface LoginFormType {
  account: string;
  password: string;
}
// 登录响应类型
export interface LoginResType {
  token: string;
  refresh_token: string;
}
export async function Login(
  body: LoginFormType
): Promise<responseType<refreshTokenResBody>> {
  let params = {
    params: body,
  };
  const resp = await request.post(getApi.Loginapi, body, params);
  return resp.data;
}

// 刷新token传参类型
interface refreshTokenBody {
  grantType: string;
  refreshToken: string;
}

// // 刷新token响应的类型
interface refreshTokenResBody {
  token: string;
  refreshToken: string;
}
export async function refreshToken(
  parameter: refreshTokenBody
): Promise<responseType<refreshTokenResBody>> {
  const resp = await request.post(
    getApi.refreshTokenapi +
      `?grantType=refresh_token&refreshToken=${parameter.refreshToken}`
  );
  return resp.data;
}
