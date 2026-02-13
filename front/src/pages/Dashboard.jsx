import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Flex,
  Grid,
  Empty,
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
import { productAPI, storeAPI, orderAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

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
  const [stats, setStats] = useState({ all: 0, dempOn: 0, dempOff: 0, first: 0, archive: 0 });
  const [generalStats, setGeneralStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [orderData, setOrderData] = useState([]);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    if (!activeStore?.id) return;
    productAPI.getStats(activeStore.id).then(({ data }) => {
      setStats(data);
    }).catch(() => {});
  }, [activeStore?.id]);

  useEffect(() => {
    if (!activeStore?.id) return;

    // Fetch general stats for the month
    storeAPI.getGeneralStats(activeStore.id, { filter: 'month' })
      .then(({ data }) => setGeneralStats(data))
      .catch(() => {});

    // Fetch 30-day order chart data
    orderAPI.getStats(activeStore.id, { filter: 'month' })
      .then(({ data }) => {
        // API returns { orders: { "14.01": 5, "15.01": 8 }, totalOrders, totalPrice }
        const orders = data.orders || {};
        const chartArr = Object.entries(orders).map(([dateKey, count]) => ({
          date: dateKey,
          value: typeof count === 'number' ? count : 0,
        }));
        // Sort by date key (DD.MM)
        chartArr.sort((a, b) => {
          const [da, ma] = a.date.split('.').map(Number);
          const [db, mb] = b.date.split('.').map(Number);
          return (ma - mb) || (da - db);
        });
        setChartData(chartArr);
      })
      .catch(() => {});

    // Fetch weekly order data (last 7 days)
    orderAPI.getStats(activeStore.id, { filter: 'week' })
      .then(({ data }) => {
        // API returns { orders: { "07.02": 5, "08.02": 3, ... }, totalOrders, totalPrice }
        const orders = data.orders || {};
        const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
        const orderArr = [];
        for (let i = 6; i >= 0; i--) {
          const d = dayjs().subtract(i, 'day');
          // API key format: DD.MM (zero-padded)
          const key = d.format('DD.MM');
          const label = i === 0 ? 'Сегодня' : `${d.date()} ${MONTHS_SHORT[d.month()]}`;
          const fullDate = `${d.date()} ${MONTHS_SHORT[d.month()]} ${d.year()}`;
          orderArr.push({
            day: label,
            fullDate: i === 0 ? `Сегодня, ${fullDate}` : fullDate,
            orders: orders[key] || 0,
          });
        }
        setOrderData(orderArr);
      })
      .catch(() => {
        // Fallback: empty 7 days
        const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
        const orderArr = [];
        for (let i = 6; i >= 0; i--) {
          const d = dayjs().subtract(i, 'day');
          const label = i === 0 ? 'Сегодня' : `${d.date()} ${MONTHS_SHORT[d.month()]}`;
          orderArr.push({ day: label, fullDate: label, orders: 0 });
        }
        setOrderData(orderArr);
      });
  }, [activeStore?.id]);

  const totalProducts = stats.all || 0;
  const activeProducts = (stats.dempOn || 0) + (stats.dempOff || 0);
  const top1Count = stats.first || 0;

  const turnover = generalStats?.turnover?.value || 0;
  const turnoverChange = generalStats?.turnover?.percentageDifference || 0;
  const ordersCount = generalStats?.amountOfSells?.value || 0;
  const ordersChange = generalStats?.amountOfSells?.percentageDifference || 0;

  const formatMoney = (v) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)} млн ₸`;
    if (v >= 1000) return `${Math.round(v).toLocaleString('ru-RU')} ₸`;
    return `${v} ₸`;
  };

  const metrics = [
    {
      title: 'Выручка за месяц',
      value: formatMoney(turnover),
      change: `${turnoverChange > 0 ? '+' : ''}${turnoverChange.toFixed(1)}%`,
      up: turnoverChange > 0 ? true : turnoverChange < 0 ? false : null,
      icon: <DollarOutlined style={{ color: '#8c8c8c' }} />,
      bg: '#f5f5f5',
    },
    {
      title: 'Заказы',
      value: String(ordersCount),
      change: `${ordersChange > 0 ? '+' : ''}${ordersChange.toFixed(1)}%`,
      up: ordersChange > 0 ? true : ordersChange < 0 ? false : null,
      icon: <ShoppingOutlined style={{ color: '#8c8c8c' }} />,
      bg: '#f5f5f5',
    },
    {
      title: 'Активных товаров',
      value: String(activeProducts),
      change: `из ${totalProducts}`,
      up: null,
      icon: <InboxOutlined style={{ color: '#8c8c8c' }} />,
      bg: '#f5f5f5',
    },
    {
      title: 'Товаров в ТОП-1',
      value: String(top1Count),
      change: `из ${totalProducts} товаров`,
      up: null,
      icon: <TrophyOutlined style={{ color: '#8c8c8c' }} />,
      bg: '#f5f5f5',
    },
  ];

  const chartHeight = isMobile ? 220 : 300;

  const columnConfig = {
    data: orderData,
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
    data: chartData,
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
        labelFormatter: (v) => v,
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
      items: [(d) => ({ name: d.date, value: `${d.value} заказов` })],
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
            title={<Text strong style={{ fontSize: isMobile ? 13 : 14 }}>Заказы за 30 дней</Text>}
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
