// src/shims-axios.d.ts
import { AxiosError } from 'axios';

// 为了使 AxiosError 类型全局可用，直接导入
declare global {
  type AxiosErrorType = AxiosError; // 这里可以给 AxiosError 类型起个别名，方便使用
}
