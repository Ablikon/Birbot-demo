import { useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Avatar,
  Flex,
  List,
  Grid,
} from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Area, Column } from '@ant-design/charts';
import { useStore } from '../context/StoreContext';
import productsData from '../assets/products.json';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

function computeStats() {
  const total = productsData.length;
  const active = productsData.filter((p) => p.isActive).length;
  const avgRating = (productsData.reduce((s, p) => s + (p.rating || 0), 0) / total).toFixed(1);
  const totalReviews = productsData.reduce((s, p) => s + (p.reviewCount || 0), 0);

  const categories = {};
  productsData.forEach((p) => {
    const cat = p.category_full_path?.split(' > ')[1] || 'Другое';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  const topCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const brands = {};
  productsData.forEach((p) => {
    if (p.brand) brands[p.brand] = (brands[p.brand] || 0) + 1;
  });
  const topBrands = Object.entries(brands)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  const recentProducts = [...productsData]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return { total, active, avgRating, totalReviews, topCategories, topBrands, recentProducts };
}

function generateWeeklyData() {
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  return days.map((day) => ({
    day,
    orders: Math.floor(Math.random() * 60 + 15),
  }));
}

function generateDailyTrend() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`,
      value: Math.floor(Math.random() * 200000 + 50000),
    });
  }
  return data;
}

const iconStyle = (bg) => ({
  width: 38,
  height: 38,
  borderRadius: 10,
  background: bg,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 16,
  flexShrink: 0,
});

export default function Dashboard() {
  const { activeStore } = useStore();
  const stats = useMemo(computeStats, []);
  const weeklyData = useMemo(generateWeeklyData, []);
  const trendData = useMemo(generateDailyTrend, []);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const metrics = [
    {
      title: 'Выручка за месяц',
      value: '2 847 500 ₸',
      change: '+12.3%',
      up: true,
      icon: <DollarOutlined style={{ color: '#8c8c8c' }} />,
      bg: '#f5f5f5',
    },
    {
      title: 'Заказы',
      value: '412',
      change: '+8.1%',
      up: true,
      icon: <ShoppingOutlined style={{ color: '#8c8c8c' }} />,
      bg: '#f5f5f5',
    },
    {
      title: 'Активных товаров',
      value: String(stats.active),
      change: `из ${stats.total}`,
      up: null,
      icon: <InboxOutlined style={{ color: '#8c8c8c' }} />,
      bg: '#f5f5f5',
    },
    {
      title: 'Средний рейтинг',
      value: stats.avgRating,
      change: `${stats.totalReviews.toLocaleString('ru-RU')} отзывов`,
      up: null,
      icon: <StarOutlined style={{ color: '#8c8c8c' }} />,
      bg: '#f5f5f5',
    },
  ];

  const chartHeight = isMobile ? 180 : 230;

  const columnConfig = {
    data: weeklyData,
    xField: 'day',
    yField: 'orders',
    color: '#595959',
    columnStyle: { radius: [4, 4, 0, 0], fill: '#595959' },
    height: chartHeight,
    axis: {
      y: { label: false, grid: false },
      x: { label: { style: { fontSize: isMobile ? 11 : 12, fill: '#8c8c8c' } } },
    },
    tooltip: {
      channel: 'y',
      valueFormatter: (v) => `${v} заказов`,
    },
    interaction: { elementHighlight: { background: true } },
  };

  const areaConfig = {
    data: trendData,
    xField: 'date',
    yField: 'value',
    smooth: true,
    style: {
      fill: 'linear-gradient(-90deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.01) 100%)',
      lineWidth: 2,
      stroke: '#595959',
    },
    height: chartHeight,
    axis: {
      y: {
        labelFormatter: (v) => `${(v / 1000).toFixed(0)}k`,
        grid: true,
        gridLineDash: [3, 3],
        gridStroke: '#f0f0f0',
        label: { style: { fill: '#8c8c8c', fontSize: 11 } },
      },
      x: {
        label: { autoRotate: false, style: { fontSize: 10, fill: '#8c8c8c' } },
        tickCount: isMobile ? 5 : 8,
      },
    },
    tooltip: {
      channel: 'y',
      valueFormatter: (v) => `${v.toLocaleString('ru-RU')} ₸`,
    },
  };

  return (
    <div>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: isMobile ? 18 : undefined }}>Обзор</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>{activeStore?.name || 'Выберите магазин'}</Text>
      </div>

      {/* Metrics */}
      <Row gutter={[isMobile ? 10 : 16, isMobile ? 10 : 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
        {metrics.map((m) => (
          <Col xs={12} md={6} key={m.title}>
            <Card size="small" className="metric-card" styles={{ body: { padding: isMobile ? 12 : 16 } }}>
              <Flex gap={isMobile ? 8 : 12} align="flex-start">
                <div style={iconStyle(m.bg)}>
                  {m.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <Text type="secondary" style={{ fontSize: isMobile ? 10 : 11, display: 'block', lineHeight: 1.3 }}>{m.title}</Text>
                  <div style={{ fontSize: isMobile ? 17 : 22, fontWeight: 600, lineHeight: 1.4, color: '#141414' }}>{m.value}</div>
                  {m.up !== null ? (
                    <Text style={{ fontSize: isMobile ? 11 : 12, color: m.up ? '#389e0d' : '#cf1322' }}>
                      {m.up ? <RiseOutlined /> : <FallOutlined />} {m.change}
                    </Text>
                  ) : (
                    <Text type="secondary" style={{ fontSize: isMobile ? 11 : 12 }}>{m.change}</Text>
                  )}
                </div>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts */}
      <Row gutter={[isMobile ? 10 : 16, isMobile ? 10 : 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Col xs={24} lg={14}>
          <Card
            size="small"
            title={<Text strong style={{ fontSize: isMobile ? 13 : 14 }}>Выручка за 30 дней</Text>}
            styles={{ body: { padding: isMobile ? '8px 10px 12px' : '12px 16px 16px' } }}
          >
            <Area {...areaConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            size="small"
            title={<Text strong style={{ fontSize: isMobile ? 13 : 14 }}>Заказы по дням недели</Text>}
            styles={{ body: { padding: isMobile ? '8px 10px 12px' : '12px 16px 16px' } }}
          >
            <Column {...columnConfig} />
          </Card>
        </Col>
      </Row>

      {/* Bottom row — equal height */}
      <Row gutter={[isMobile ? 10 : 16, isMobile ? 10 : 16]}>
        <Col xs={24} md={8}>
          <Card
            size="small"
            title={<Text strong style={{ fontSize: isMobile ? 13 : 14 }}>Категории</Text>}
            style={{ height: '100%' }}
            styles={{ body: { padding: '4px 0' } }}
          >
            <div className="dashboard-list">
              <List
                size="small"
                split={false}
                dataSource={stats.topCategories}
                renderItem={(item) => (
                  <List.Item style={{ borderBottom: 'none', padding: '8px 16px' }}>
                    <Text ellipsis style={{ maxWidth: isMobile ? '60vw' : 180, fontSize: 13 }}>{item.name}</Text>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{item.count}</Text>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            size="small"
            title={<Text strong style={{ fontSize: isMobile ? 13 : 14 }}>Популярные бренды</Text>}
            style={{ height: '100%' }}
            styles={{ body: { padding: '4px 0' } }}
          >
            <div className="dashboard-list">
              <List
                size="small"
                split={false}
                dataSource={stats.topBrands}
                renderItem={(item) => (
                  <List.Item style={{ borderBottom: 'none', padding: '8px 16px' }}>
                    <Text ellipsis style={{ maxWidth: isMobile ? '60vw' : 180, fontSize: 13 }}>{item.name}</Text>
                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>{item.count}</Text>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            size="small"
            title={<Text strong style={{ fontSize: isMobile ? 13 : 14 }}>Последние товары</Text>}
            style={{ height: '100%' }}
            styles={{ body: { padding: '4px 0' } }}
          >
            <div className="dashboard-list">
              <List
                size="small"
                split={false}
                dataSource={stats.recentProducts}
                renderItem={(item) => (
                  <List.Item style={{ borderBottom: 'none', padding: '6px 16px' }}>
                    <Flex gap={10} align="center" style={{ minWidth: 0 }}>
                      <Avatar
                        shape="square"
                        size={34}
                        src={item.url_picture}
                        style={{ borderRadius: 6, flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <Text ellipsis style={{ fontSize: 12, display: 'block', maxWidth: isMobile ? '55vw' : 140 }}>{item.title}</Text>
                        <Text type="secondary" style={{ fontSize: 11 }}>{item.price.toLocaleString('ru-RU')} ₸</Text>
                      </div>
                    </Flex>
                  </List.Item>
                )}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
