import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "@/features/themes/themeSlice";
import userReducer from "@/features/user/userSlice";
import layoutReducer from "@/slice/layoutSlice";
import editorReducer from "@/slice/editorSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    users: userReducer,
    layout: layoutReducer,
    editor: editorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
