import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Sử dụng localStorage
import userReducer from "./slices/userSlice";

// Cấu hình redux-persist
const persistConfig = {
  key: "root",
  storage,
};

// Tạo persist reducer
const persistedReducer = persistReducer(persistConfig, userReducer);

// Tạo store với persisted reducer
const store = configureStore({
    reducer: {
      user: persistedReducer, // Đảm bảo reducer `user` được bọc bởi `persistReducer`
    },
});

// Tạo persistor
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;