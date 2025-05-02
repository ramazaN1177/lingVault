import React from 'react';
import { Spin, Space } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface CustomLoaderProps {
  size?: 'small' | 'default' | 'large';
  tip?: string;
  fullScreen?: boolean;
  color?: string;
}

const loader: React.FC<CustomLoaderProps> = ({
  size = 'default',
  tip = 'Yükleniyor...',
  fullScreen = false,
  color = '#1890ff',
}) => {
  // Özel spinner ikonu oluşturma
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'small' ? 24 : size === 'large' ? 40 : 32, color }} spin />;

  // Tam ekran loader için stil
  const fullScreenStyle: React.CSSProperties = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
      }
    : {};

  return (
    <div style={fullScreenStyle}>
      <Space direction="vertical" align="center">
        <Spin indicator={antIcon} tip={tip} size={size} />
      </Space>
    </div>
  );
};

export default loader;