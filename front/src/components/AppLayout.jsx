import { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Space, Select, Badge, Drawer } from 'antd';
import {
  PieChartOutlined,
  AppstoreOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  BellOutlined,
  SettingOutlined,
  ShopOutlined,
  MenuOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const MOBILE_BREAKPOINT = 768;

const menuItems = [
  { key: '/', icon: <PieChartOutlined />, label: 'Обзор' },
  { key: '/products', icon: <AppstoreOutlined />, label: 'Товары' },
  { key: '/stores', icon: <ShopOutlined />, label: 'Магазины' },
];

const userMenuItems = [
  { key: 'settings', icon: <SettingOutlined />, label: 'Настройки' },
  { type: 'divider' },
  { key: 'logout', icon: <LogoutOutlined />, label: 'Выйти', danger: true },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isMobile;
}

const Logo = ({ collapsed }) => (
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
);

const SidebarContent = ({ collapsed, activeStore, storeOptions, handleStoreChange, location, navigate, onItemClick }) => (
  <>
    <Logo collapsed={collapsed} />
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
      onClick={({ key }) => { navigate(key); onItemClick?.(); }}
      style={{ border: 'none', background: 'transparent' }}
    />
  </>
);

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { stores, activeStore, setActiveStore } = useStore();
  const { user, logout } = useAuth();

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  const storeOptions = stores.map((s) => ({ value: s.id, label: s.name }));

  const handleStoreChange = (storeId) => {
    const store = stores.find((s) => s.id === storeId);
    if (store) setActiveStore(store);
  };

  const handleUserMenuClick = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login', { replace: true });
    }
  };

  const initials = user?.name
    ? user.name.trim().charAt(0).toUpperCase()
    : 'U';

  const sidebarProps = {
    collapsed: false,
    activeStore,
    storeOptions,
    handleStoreChange,
    location,
    navigate,
    onItemClick: () => setDrawerOpen(false),
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      {!isMobile && (
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
          <SidebarContent {...sidebarProps} collapsed={collapsed} />
        </Sider>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={260}
          styles={{
            body: { padding: 0 },
            header: { display: 'none' },
          }}
          className="mobile-sidebar-drawer"
        >
          <SidebarContent {...sidebarProps} />
        </Drawer>
      )}

      <Layout
        style={{
          marginLeft: isMobile ? 0 : (collapsed ? 64 : 220),
          transition: 'margin-left 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Header
          className="app-header"
          style={{
            padding: isMobile ? '0 16px' : '0 24px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              onClick={() => isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed)}
              style={{
                cursor: 'pointer',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                color: '#8c8c8c',
                padding: 6,
                borderRadius: 6,
                transition: 'color 0.2s ease',
              }}
            >
              {isMobile ? <MenuOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            </div>
            {isMobile && (
              <Text strong style={{ fontSize: 15, letterSpacing: -0.3 }}>birbot</Text>
            )}
          </div>

          <Space size={12}>
            <Badge dot offset={[-2, 2]}>
              <BellOutlined
                style={{
                  fontSize: 16,
                  color: '#8c8c8c',
                  cursor: 'pointer',
                  padding: 6,
                }}
              />
            </Badge>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight" arrow trigger={['click']}>
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

        <Content
          className="app-content"
          style={{
            padding: isMobile ? 16 : 24,
            paddingBottom: isMobile ? 24 : 24,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
