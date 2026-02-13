import { useState, useMemo } from 'react';
import {
  Table,
  Input,
  Switch,
  Tag,
  Avatar,
  Space,
  Typography,
  Card,
  Button,
  InputNumber,
  Tooltip,
  Row,
  Col,
  Select,
  Drawer,
  Descriptions,
  Image,
  Rate,
  Divider,
  Flex,
  Tabs,
  message,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  ExportOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useStore } from '../context/StoreContext';
import productsData from '../assets/products.json';

const { Text, Title } = Typography;

function enrichProducts(products) {
  return products.map((p, i) => ({
    ...p,
    minPrice: Math.round(p.price * 0.85),
    maxPrice: Math.round(p.price * 2.5),
    step: [5, 10, 25, 50, 100, 105][i % 6],
    decreaseEnabled: i % 3 !== 0,
    increaseEnabled: i % 2 === 0,
    status: p.isActive ? 'active' : 'archived',
  }));
}

export default function Products() {
  const { activeStore } = useStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [pageSize, setPageSize] = useState(15);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allProducts = useMemo(() => enrichProducts(productsData), []);
  const [products, setProducts] = useState(allProducts);

  // Extract unique categories for filter
  const categoryOptions = useMemo(() => {
    const cats = new Set();
    productsData.forEach((p) => {
      const cat = p.category_full_path?.split(' > ')[1];
      if (cat) cats.add(cat);
    });
    return [...cats].sort().map((c) => ({ label: c, value: c }));
  }, []);

  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.productId?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    }
    if (activeTab === 'active') result = result.filter((p) => p.status === 'active');
    if (activeTab === 'archived') result = result.filter((p) => p.status === 'archived');
    if (categoryFilter) {
      result = result.filter((p) => p.category_full_path?.includes(categoryFilter));
    }
    return result;
  }, [products, search, activeTab, categoryFilter]);

  const handleToggle = (id, field, checked) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, [field]: checked } : p))
    );
    message.success({ content: checked ? 'Включено' : 'Отключено', duration: 1 });
  };

  const openDetail = (product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  };

  const activeCount = products.filter((p) => p.status === 'active').length;
  const archivedCount = products.filter((p) => p.status === 'archived').length;

  const tabItems = [
    { key: 'all', label: `Все (${products.length})` },
    { key: 'active', label: `Активные (${activeCount})` },
    { key: 'archived', label: `Архив (${archivedCount})` },
  ];

  const columns = [
    {
      title: 'Товар',
      key: 'product',
      width: 340,
      render: (_, record) => (
        <Flex gap={10} align="center">
          <Avatar
            shape="square"
            size={40}
            src={record.url_picture}
            style={{ borderRadius: 8, flexShrink: 0, cursor: 'pointer' }}
            onClick={() => openDetail(record)}
          />
          <div style={{ minWidth: 0 }}>
            <Text
              strong
              style={{ fontSize: 13, display: 'block', cursor: 'pointer', lineHeight: 1.4 }}
              ellipsis={{ tooltip: record.title }}
              onClick={() => openDetail(record)}
            >
              {record.title}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.productId}
            </Text>
          </div>
        </Flex>
      ),
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      sorter: (a, b) => a.price - b.price,
      render: (v) => <Text strong style={{ fontSize: 13 }}>{v.toLocaleString('ru-RU')} ₸</Text>,
    },
    {
      title: 'Мин.',
      dataIndex: 'minPrice',
      key: 'minPrice',
      width: 90,
      render: (v) => <Text type="secondary" style={{ fontSize: 13 }}>{v.toLocaleString('ru-RU')}</Text>,
    },
    {
      title: 'Макс.',
      dataIndex: 'maxPrice',
      key: 'maxPrice',
      width: 100,
      render: (v) => <Text type="secondary" style={{ fontSize: 13 }}>{v.toLocaleString('ru-RU')}</Text>,
    },
    {
      title: 'Шаг',
      dataIndex: 'step',
      key: 'step',
      width: 60,
      render: (v) => <Text style={{ fontSize: 13 }}>{v}</Text>,
    },
    {
      title: 'Рейтинг',
      dataIndex: 'rating',
      key: 'rating',
      width: 80,
      sorter: (a, b) => a.rating - b.rating,
      render: (v) => (
        <Tag color={v >= 4.5 ? 'green' : v >= 3.5 ? 'gold' : 'default'} style={{ margin: 0 }}>
          {v}
        </Tag>
      ),
    },
    {
      title: 'Снижение',
      key: 'decrease',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.decreaseEnabled}
          onChange={(checked) => handleToggle(record._id, 'decreaseEnabled', checked)}
          size="small"
        />
      ),
    },
    {
      title: 'Поднятие',
      key: 'increase',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.increaseEnabled}
          onChange={(checked) => handleToggle(record._id, 'increaseEnabled', checked)}
          size="small"
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 40,
      render: (_, record) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => openDetail(record)}
        />
      ),
    },
  ];

  return (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Товары</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>{activeStore?.name}</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} style={{ fontWeight: 500 }}>Синхронизация</Button>
        </Space>
      </Flex>

      <Card size="small" style={{ marginBottom: 0 }} styles={{ body: { padding: 0 } }}>
        {/* Tabs as filter */}
        <div style={{ padding: '0 20px' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ marginBottom: 0 }}
            size="middle"
          />
        </div>

        {/* Search + filters inline */}
        <Flex
          gap={10}
          align="center"
          wrap="wrap"
          style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}
        >
          <Input
            placeholder="Найти товар..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ maxWidth: 260 }}
            variant="filled"
          />
          <Select
            placeholder="Категория"
            options={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
            allowClear
            style={{ minWidth: 200 }}
            size="middle"
            suffixIcon={<FilterOutlined />}
            variant="filled"
          />
          <div style={{ flex: 1 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {filtered.length} из {products.length}
          </Text>
        </Flex>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="_id"
          size="small"
          scroll={{ x: 1000 }}
          pagination={{
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '30', '50'],
            onShowSizeChange: (_, size) => setPageSize(size),
            size: 'small',
            style: { padding: '0 16px' },
          }}
          rowSelection={{ type: 'checkbox' }}
        />
      </Card>

      <Drawer
        title={<Text strong style={{ fontSize: 15 }}>Карточка товара</Text>}
        placement="right"
        width={460}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: '16px 20px' } }}
        extra={
          selectedProduct && (
            <Button
              type="text"
              size="small"
              icon={<ExportOutlined />}
              href={selectedProduct.productUrl}
              target="_blank"
              style={{ color: '#8c8c8c' }}
            >
              Kaspi
            </Button>
          )
        }
      >
        {selectedProduct && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16, background: '#fafafa', borderRadius: 12, padding: 20 }}>
              <Image
                src={selectedProduct.url_picture}
                width={160}
                style={{ borderRadius: 10 }}
              />
            </div>

            {selectedProduct.images?.length > 1 && (
              <Flex gap={6} justify="center" style={{ marginBottom: 20 }}>
                <Image.PreviewGroup>
                  {selectedProduct.images.slice(1, 5).map((img, i) => (
                    <Image key={i} src={img} width={48} style={{ borderRadius: 8 }} />
                  ))}
                </Image.PreviewGroup>
              </Flex>
            )}

            <Card size="small" style={{ marginBottom: 16 }} styles={{ body: { padding: 14 } }}>
              <Descriptions column={2} size="small" colon={false}>
                <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Цена</Text>} span={1}>
                  <Text strong>{selectedProduct.price.toLocaleString('ru-RU')} ₸</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Шаг</Text>} span={1}>
                  {selectedProduct.step} ₸
                </Descriptions.Item>
                <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Мин.</Text>} span={1}>
                  {selectedProduct.minPrice.toLocaleString('ru-RU')} ₸
                </Descriptions.Item>
                <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Макс.</Text>} span={1}>
                  {selectedProduct.maxPrice.toLocaleString('ru-RU')} ₸
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Descriptions column={1} size="small" colon={false}>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Артикул</Text>}>{selectedProduct.productId}</Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Бренд</Text>}>{selectedProduct.brand}</Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Категория</Text>}>
                <Text style={{ fontSize: 12 }}>{selectedProduct.category_full_path}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Город</Text>}>{selectedProduct.city}</Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Рейтинг</Text>}>
                <Space>
                  <Rate disabled value={selectedProduct.rating} allowHalf style={{ fontSize: 13 }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>({selectedProduct.rating})</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Отзывов</Text>}>{selectedProduct.reviewCount}</Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Наличие</Text>}>
                <Tag color={selectedProduct.inStock ? 'success' : 'error'} style={{ fontSize: 11 }}>
                  {selectedProduct.inStock ? 'Есть' : 'Нет'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '14px 0' }} />

            <Flex gap={24}>
              <Space>
                <Text type="secondary" style={{ fontSize: 12 }}>Снижение</Text>
                <Switch checked={selectedProduct.decreaseEnabled} size="small" />
              </Space>
              <Space>
                <Text type="secondary" style={{ fontSize: 12 }}>Поднятие</Text>
                <Switch checked={selectedProduct.increaseEnabled} size="small" />
              </Space>
            </Flex>
          </>
        )}
      </Drawer>
    </div>
  );
}
