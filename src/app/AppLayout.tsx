'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Button, Drawer, Space, message, Spin } from 'antd';
import { BookOutlined, RocketOutlined, MenuOutlined, GithubOutlined, LinkedinOutlined, LogoutOutlined } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useLogOut } from '@/react-query/queriessAndMutations';
import { useUserContext } from '@/context/AuthContext';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const headerStyle = {
  backgroundColor: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  padding: '0 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const logoStyle = {
  color: '#1890ff',
  margin: 0,
};

const contentStyle = {
  padding: '24px',
  backgroundColor: '#f5f5f5',
};

const contentContainerStyle = {
  backgroundColor: '#fff',
  padding: '24px',
  borderRadius: '8px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  backgroundColor: '#fff',
  borderTop: '1px solid #f0f0f0',
};

const footerTextStyle = {
  color: 'rgba(0,0,0,0.45)',
};

const AppLayout = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(true);
    const { mutate: logOut, isSuccess } = useLogOut();
    const { user } = useUserContext();
    
    // Debug the current pathname
    useEffect(() => {
      console.log("Current pathname:", pathname);
    }, [pathname]);
    
    // Redirect if logout is successful
    useEffect(() => {
      if (isSuccess) {
        router.push('/');
      }
    }, [isSuccess, router]);
    
    // Check for mobile view
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
  
    const menuItems = [
      {
        key: '/main',
        icon: <BookOutlined />,
        label: 'Manage Words',
      },
      {
        key: '/randompage',
        icon: <RocketOutlined />,
        label: 'Practice Words',
      },
    ];
  
    const toggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
    };
  
    // Navigation handler with debugging
    const handleNavigation = (path: string) => {
      console.log("Navigating to:", path);
      setMobileMenuOpen(false);
      router.push(path);
    };
  
    // Don't render the full layout for login/register pages
    const isAuthPage = pathname === '/' || pathname === '/' || pathname === '/';
    
    if (isAuthPage) {
      // Just return children for auth pages without the layout
      return children;
    }
  
    if (!user) {
      // For protected pages, redirect to login if not authenticated
      console.log("User not authenticated, redirecting to login");
      router.push('/');
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Spin size="large" />
        </div>
      );
    }
  
    // For authenticated users on protected pages, show the full layout
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <ToastContainer />
        <Header style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Title level={4} style={logoStyle}>LingoVault</Title>
          </div>
          
          {isMobile ? (
            <>
              <Button type="text" icon={<MenuOutlined />} onClick={toggleMobileMenu} />
              <Drawer 
                title="Menu" 
                placement="right"
                onClose={toggleMobileMenu}
                open={mobileMenuOpen}
              >
                <Menu
                  mode="vertical"
                  selectedKeys={[pathname]}
                  onClick={({ key }) => handleNavigation(key as string)}
                  items={menuItems}
                />
                <div style={{ marginTop: 16 }}>
                  <Button 
                    type="primary" 
                    danger 
                    icon={<LogoutOutlined />}
                    onClick={() => {
                      logOut();
                      toggleMobileMenu();
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </Drawer>
            </>
          ) : (
            <div style={{ display: 'flex' }}>
              <Menu
                mode="horizontal"
                selectedKeys={[pathname]}
                onClick={({ key }) => handleNavigation(key as string)}
                items={menuItems}
                style={{ border: 'none', flex: 1 }}
              />
              <Button 
                type="text" 
                danger 
                icon={<LogoutOutlined />}
                onClick={() => logOut()}
              >
                Logout
              </Button>
            </div>
          )}
        </Header>
        
        <Content style={contentStyle}>
          <div style={contentContainerStyle}>
            {children}
          </div>
        </Content>
        
        <Footer style={footerStyle}>
          <div>
            <p style={footerTextStyle}>
              LingoVault © {new Date().getFullYear()} - Your Personal Vocabulary Manager
            </p>
            <Space>
              <Button 
                type="text" 
                icon={<GithubOutlined />} 
                target="_blank"
              />
              <Button 
                type="text" 
                icon={<LinkedinOutlined />} 
                target="_blank"
              />
            </Space>
          </div>
        </Footer>
      </Layout>
    );
  };
  
  export default AppLayout;