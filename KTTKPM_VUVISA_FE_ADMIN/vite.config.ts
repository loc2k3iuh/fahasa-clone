import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'



export default defineConfig({

    define: {
    global: 'window'  // 👈 Fix lỗi `global is not defined`
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 8888,
    open: 'admin/login',
  },
})
