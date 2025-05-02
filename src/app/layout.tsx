'use client';

import "@ant-design/pro-layout";
import { ConfigProvider } from "antd";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import AppLayout from "./AppLayout";
import AuthProvider from "@/context/AuthContext";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <html lang="tr">
      <body>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider>
          <AuthProvider>
        
              <AppLayout>
                {children}
              </AppLayout>
           
          </AuthProvider>
          </ConfigProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}