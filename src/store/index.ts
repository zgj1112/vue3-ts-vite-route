// 使用方法
// import { useStore } from 'src/store/index';
// const usestore = useStore();
// <div>Count: {{ usestate.count }}</div>
// <div>Double Count: {{ usestate.doubleCount }}</div>
// <div @click="usestate.increment">Increment</div>

import { Store, defineStore } from "pinia";

// 定义状态类型
interface StoreType {
  count: number;
  message: string;
}

export const useStore = defineStore("usestate", {
  // 状态
  state: (): StoreType => ({
    count: 0,
    message: "Hello from Pinia",
  }),

  // 修改状态的方法
  actions: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
    setMessage(message: string) {
      this.message = message;
    },
  },

  // 计算属性
  getters: {
    doubleCount(): number {
      return this.count * 2;
    },
  },
});
