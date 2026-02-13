import { useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Flex,
  Grid,
} from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  ShoppingOutlined,
  DollarOutlined,
  InboxOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Area, Column } from '@ant-design/charts';
import { useStore } from '../context/StoreContext';
import productsData from '../assets/products.json';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function computeStats() {
  const total = productsData.length;
  const active = productsData.filter((p) => p.isActive).length;
  const top1Count = Math.floor(total * 0.06);

  return { total, active, top1Count };
}

function generateLast7DaysData() {
  const data = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = i === 0
      ? 'Сегодня'
      : `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
    const fullDate = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
    data.push({
      day: label,
      fullDate: i === 0 ? `Сегодня, ${fullDate}` : fullDate,
      orders: Math.floor(Math.random() * 60 + 15),
    });
  }
  return data;
}

function generateDailyTrend() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`,
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
  const weeklyData = useMemo(generateLast7DaysData, []);
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
      title: 'Товаров в ТОП-1',
      value: String(stats.top1Count),
      change: `из ${stats.total} товаров`,
      up: null,
      icon: <TrophyOutlined style={{ color: '#8c8c8c' }} />,
      bg: '#f5f5f5',
    },
  ];

  const chartHeight = isMobile ? 220 : 300;

  const columnConfig = {
    data: weeklyData,
    xField: 'day',
    yField: 'orders',
    color: '#595959',
    columnStyle: { radius: [4, 4, 0, 0], fill: '#595959' },
    height: chartHeight,
    marginTop: 24,
    label: {
      text: 'orders',
      position: 'top',
      offset: 16,
      style: { fontSize: 11, fill: '#595959', fontWeight: 500, textAlign: 'center', textBaseline: 'bottom' },
    },
    axis: {
      y: { label: false, grid: false },
      x: { label: { style: { fontSize: isMobile ? 10 : 12, fill: '#8c8c8c' } } },
    },
    tooltip: {
      title: false,
      items: [(d) => ({ name: d.fullDate, value: `${d.orders} заказов` })],
    },
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
        label: { autoRotate: false, style: { fontSize: isMobile ? 9 : 11, fill: '#8c8c8c' } },
        tickCount: isMobile ? 5 : 7,
      },
    },
    tooltip: {
      title: false,
      items: [(d) => ({ name: d.date, value: `${d.value.toLocaleString('ru-RU')} ₸` })],
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
            style={{ height: '100%' }}
          >
            <Area {...areaConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card
            size="small"
            title={<Text strong style={{ fontSize: isMobile ? 13 : 14 }}>Заказы за последние 7 дней</Text>}
            styles={{ body: { padding: isMobile ? '8px 10px 12px' : '12px 16px 16px' } }}
            style={{ height: '100%' }}
          >
            <Column {...columnConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
