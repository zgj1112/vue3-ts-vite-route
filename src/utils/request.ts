// src/utils/request.ts
import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { useRouter, Router } from "vue-router";
import storeage from "store";
import { useStore } from "src/store/index";
import { refreshToken, getApi } from "@api/login";
const router: Router = useRouter();

let ACCESS_TOKEN = "token";
let REFRESH_TOKEN = "refresh_token";

const instance: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000, // 请求超时设置
});

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token: string = storeage.get(ACCESS_TOKEN);
    if (token) {
      // 没有token才带上token
      if (
        !config.headers[ACCESS_TOKEN] &&
        !(config.url as string).includes(getApi.refreshTokenapi)
      ) {
        config.headers[ACCESS_TOKEN] = token;
      }

      // 刷新token需要去除token来调用
      if (
        !config.headers[REFRESH_TOKEN] &&
        !(config.url as string).includes(getApi.refreshTokenapi) &&
        config.url != getApi.Loginapi
      ) {
        const refreshtoken: string = storeage.get(REFRESH_TOKEN);
        config.headers[REFRESH_TOKEN] = refreshtoken;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
let firstLogoutTime: number; //记录重复响应时间
let isRefreshing = false; // 是否正在请求刷新token接口的标记
let requestarr: any[] = []; // 请求队列

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data; // T
    const config = response.config;
    if (data.code == "200") {
      return response;
    } else if (data.code == "401" || data.code == "00201") {
      const oldrefreshtoken: string = storeage.get(REFRESH_TOKEN);

      // 如果没有refreshToken,则退出
      if (!oldrefreshtoken) {
        router.push({ path: "/user/login" });
        // let originurl = window.location.origin;
        // window.location.href = originurl;
        return;
      }

      // 开始处理刷新
      if (!isRefreshing) {
        isRefreshing = true;

        let refreshbody = {
          grantType: REFRESH_TOKEN,
          refreshToken: oldrefreshtoken,
        };

        // 刷新token
        const usestore = useStore();
        // console.log("准备刷新token", oldrefreshtoken);
        config.headers.token = "";
        return refreshToken(refreshbody)
          .then((responsex) => {
            // console.log("刷新token成功", responsex);
            if (responsex.code == 200) {
              // 更新token
              const access_token = responsex.data.token;
              const refresh_token = responsex.data.refreshToken;

              // 更新 Vuex 或状态管理中的 token
              storeage.set(ACCESS_TOKEN, access_token);
              storeage.set(REFRESH_TOKEN, refresh_token);
              // usestore.SET_ACCESS_TOKEN(access_token);
              // usestore.SET_REFRESH_TOKEN(refresh_token);

              // 重新插入请求头
              config.headers[ACCESS_TOKEN] = access_token;
              config.headers[REFRESH_TOKEN] = refresh_token;

              requestarr.forEach((cb) => cb(access_token, refresh_token)); //执行未执行的接口
              requestarr = [];
              // console.log('刷新token完成');
              return instance(config); //再次执行当前接口
            } else if (responsex.code == "40101") {
              // console.log("清除所有存储用户信息跳转登录模块");
              storeage.remove(ACCESS_TOKEN);
              storeage.remove(REFRESH_TOKEN);
              // usestore.SET_ACCESS_TOKEN("");
              // usestore.SET_REFRESH_TOKEN("");
              timemsgFun(responsex.msg);
              // router.push({ path: "/user/login" });
            }
          })
          .finally(() => {
            isRefreshing = false;
          });
      } else {
        // 正在刷新token，返回一个未执行resolve的promise
        // console.log('正在添加接口刷新列表');
        return new Promise((resolve) => {
          // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
          requestarr.push((access_token: string, refresh_token: string) => {
            config.headers[ACCESS_TOKEN] = access_token;
            config.headers[REFRESH_TOKEN] = refresh_token;
            resolve(instance(config));
          });
        });
      }

      // let time: number = new Date().getTime();
      // // 3s内不重复提示
      // if (firstLogoutTime && time - firstLogoutTime < 3000) {
      //   // return Promise.reject(new Error('登录失效'));
      // } else {
      //   firstLogoutTime = time;
      //   message.error("登录失效");
      // }

      // const token: string = storage.get("access_token");
      // if (token) {
      //   const usestore = useStore();
      //   usestore.SET_ACCESS_TOKEN("");
      //   storage.remove("access_token");
      // }
      // router.push({ name: "Login" });

      // return Promise.reject(new Error('登录失效'));
    } else if (data.code) {
      return Promise.reject(data.msg);
    }
    return data;
  },
  (error: AxiosErrorType) => {
    // 统一处理请求错误
    // message.error(error.message);
    return Promise.reject(error);
  }
);

function timemsgFun(msg: string) {
  let time = new Date().getTime();
  // 3s内不重复提示
  if (firstLogoutTime && time - firstLogoutTime < 1000) {
  } else {
    firstLogoutTime = time;
    // message.error(msg);
  }
}

export default instance;
