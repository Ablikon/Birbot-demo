import { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Space, Select, theme, Badge } from 'antd';
import {
  PieChartOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
  {
    key: '/',
    icon: <PieChartOutlined />,
    label: 'Обзор',
  },
  {
    key: '/products',
    icon: <AppstoreOutlined />,
    label: 'Товары',
  },
  {
    key: '/stores',
    icon: <ShopOutlined />,
    label: 'Магазины',
  },
];

const userMenuItems = [
  {
    key: 'settings',
    icon: <SettingOutlined />,
    label: 'Настройки',
  },
  { type: 'divider' },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: 'Выйти',
    danger: true,
  },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { stores, activeStore, setActiveStore } = useStore();

  const storeOptions = stores.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const handleStoreChange = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    if (store) setActiveStore(store);
  };

  const initials = activeStore?.name
    ? activeStore.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={220}
        collapsedWidth={64}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 100,
          overflow: 'auto',
          borderRight: '1px solid #eee',
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '0' : '0 16px',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: '#141414',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 15,
              flexShrink: 0,
            }}
          >
            B
          </div>
          {!collapsed && (
            <Text strong style={{ fontSize: 16, letterSpacing: -0.3 }}>birbot</Text>
          )}
        </div>

        {/* Store selector */}
        {!collapsed && (
          <div style={{ padding: '4px 10px 10px' }}>
            <Select
              value={activeStore?.id}
              onChange={handleStoreChange}
              options={storeOptions}
              style={{ width: '100%' }}
              size="small"
              popupMatchSelectWidth={false}
              variant="filled"
            />
          </div>
        )}

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ border: 'none', background: 'transparent' }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 64 : 220, transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)' }}>
        <Header
          style={{
            padding: '0 24px',
            background: '#fff',
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
            lineHeight: '56px',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              cursor: 'pointer',
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              color: '#8c8c8c',
              padding: 4,
              borderRadius: 6,
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#141414')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8c8c8c')}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          <Space size={12}>
            <Badge dot offset={[-2, 2]}>
              <BellOutlined
                style={{
                  fontSize: 16,
                  color: '#8c8c8c',
                  cursor: 'pointer',
                  padding: 4,
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#141414')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#8c8c8c')}
              />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Avatar
                size={30}
                style={{
                  background: '#141414',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: 0.5,
                }}
              >
                {initials}
              </Avatar>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ padding: 24, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
