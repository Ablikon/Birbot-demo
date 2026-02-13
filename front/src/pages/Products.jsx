import { useState, useMemo } from 'react';
import {
  Table,
  Input,
  Tag,
  Avatar,
  Space,
  Typography,
  Card,
  Button,
  Select,
  Drawer,
  Descriptions,
  Image,
  Rate,
  Divider,
  Flex,
  Tabs,
  Grid,
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
const { useBreakpoint } = Grid;

function enrichProducts(products) {
  return products.map((p, i) => ({
    ...p,
    position: Math.floor(Math.random() * 20) + 1,
    minPrice: Math.round(p.price * 0.85),
    step: [5, 10, 25, 50, 100, 105][i % 6],
    // priceMode: 'down' | 'up' | 'off'
    priceMode: i % 3 === 0 ? 'off' : i % 2 === 0 ? 'down' : 'up',
    status: p.isActive ? 'active' : 'inactive',
  }));
}

export default function Products() {
  const { activeStore } = useStore();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
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
    if (activeTab === 'all') result = result.filter((p) => p.status === 'active');
    if (activeTab === 'inactive') result = result.filter((p) => p.status === 'inactive');
    if (categoryFilter) {
      result = result.filter((p) => p.category_full_path?.includes(categoryFilter));
    }
    return result;
  }, [products, search, activeTab, categoryFilter]);

  const handlePriceModeChange = (id, mode) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, priceMode: mode } : p))
    );
    const labels = { down: 'Снижение', up: 'Поднятие', off: 'Выключено' };
    message.success({ content: labels[mode], duration: 1 });
  };

  const openDetail = (product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  };

  const activeCount = products.filter((p) => p.status === 'active').length;
  const inactiveCount = products.filter((p) => p.status === 'inactive').length;

  const tabItems = [
    { key: 'all', label: `Активные (${activeCount})` },
    { key: 'inactive', label: `Неактивные (${inactiveCount})` },
  ];

  const priceModeOptions = [
    { value: 'down', label: 'Снижение' },
    { value: 'off', label: 'Выкл' },
    { value: 'up', label: 'Поднятие' },
  ];

  const priceModeColor = { down: '#389e0d', up: '#1677ff', off: '#d9d9d9' };
  const priceModeTag = { down: 'green', up: 'blue', off: 'default' };
  const priceModeLabel = { down: 'Снижение', up: 'Поднятие', off: 'Выкл' };

  const columns = [
    {
      title: 'Товар',
      key: 'product',
      width: isMobile ? 200 : 360,
      fixed: isMobile ? 'left' : undefined,
      render: (_, record) => (
        <Flex gap={10} align="center">
          <Avatar
            shape="square"
            size={isMobile ? 36 : 40}
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
      width: 110,
      render: (v) => <Text strong style={{ fontSize: 13 }}>{v.toLocaleString('ru-RU')} ₸</Text>,
    },
    ...(isMobile ? [] : [
      {
        title: 'Мин.',
        dataIndex: 'minPrice',
        key: 'minPrice',
        width: 100,
        render: (v) => <Text type="secondary" style={{ fontSize: 13 }}>{v.toLocaleString('ru-RU')}</Text>,
      },
      {
        title: 'Шаг',
        dataIndex: 'step',
        key: 'step',
        width: 80,
        render: (v) => <Text style={{ fontSize: 13 }}>{v}</Text>,
      },
    ]),
    {
      title: 'Позиция',
      dataIndex: 'position',
      key: 'position',
      width: 95,
      align: 'center',
      sorter: (a, b) => a.position - b.position,
      render: (v) => (
        <Tag
          color={v <= 3 ? 'green' : v <= 10 ? 'gold' : 'default'}
          style={{ margin: 0, minWidth: 32, textAlign: 'center' }}
        >
          {v}
        </Tag>
      ),
    },
    {
      title: 'Режим',
      key: 'priceMode',
      width: isMobile ? 95 : 120,
      align: 'center',
      render: (_, record) => (
        <Select
          size="small"
          value={record.priceMode}
          onChange={(val) => handlePriceModeChange(record._id, val)}
          options={priceModeOptions}
          variant="borderless"
          popupMatchSelectWidth={false}
          style={{ width: '100%' }}
          labelRender={({ value }) => (
            <Tag
              color={priceModeTag[value]}
              style={{ margin: 0, fontSize: 11, cursor: 'pointer' }}
            >
              {priceModeLabel[value]}
            </Tag>
          )}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 44,
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
      <Flex
        justify="space-between"
        align={isMobile ? 'flex-start' : 'center'}
        style={{ marginBottom: isMobile ? 12 : 20 }}
        vertical={isMobile}
        gap={isMobile ? 10 : 0}
      >
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600, fontSize: isMobile ? 18 : undefined }}>Товары</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>{activeStore?.name}</Text>
        </div>
        <Button icon={<ReloadOutlined />} style={{ fontWeight: 500 }} block={isMobile}>
          Синхронизация
        </Button>
      </Flex>

      <Card size="small" style={{ marginBottom: 0 }} styles={{ body: { padding: 0 } }}>
        {/* Tabs */}
        <div style={{ padding: isMobile ? '0 12px' : '0 20px', overflowX: 'auto' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ marginBottom: 0 }}
            size={isMobile ? 'small' : 'middle'}
          />
        </div>

        {/* Search + filters */}
        <div style={{ padding: isMobile ? '10px 12px' : '12px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <Flex
            gap={10}
            align="center"
            wrap="wrap"
          >
            <Input
              placeholder="Найти товар..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ flex: isMobile ? '1 1 100%' : '0 1 260px' }}
              variant="filled"
            />
            {!isMobile && (
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
            )}
            <div style={{ flex: 1 }} />
            <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
              {filtered.length} из {products.length}
            </Text>
          </Flex>
        </div>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="_id"
          size="small"
          scroll={{ x: isMobile ? 500 : undefined }}
          pagination={{
            pageSize: isMobile ? 10 : pageSize,
            showSizeChanger: !isMobile,
            pageSizeOptions: ['10', '15', '30', '50'],
            onShowSizeChange: (_, size) => setPageSize(size),
            size: 'small',
            style: { padding: '0 12px' },
            simple: isMobile,
          }}
          rowSelection={isMobile ? undefined : { type: 'checkbox' }}
        />
      </Card>

      <Drawer
        title={<Text strong style={{ fontSize: 15 }}>Карточка товара</Text>}
        placement="right"
        width={isMobile ? '100%' : 460}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: isMobile ? '12px 16px' : '16px 20px' } }}
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
                <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Мин. цена</Text>} span={2}>
                  {selectedProduct.minPrice.toLocaleString('ru-RU')} ₸
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
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Позиция</Text>}>
                <Tag color={selectedProduct.position <= 3 ? 'green' : selectedProduct.position <= 10 ? 'gold' : 'default'} style={{ fontSize: 12 }}>
                  {selectedProduct.position} место
                </Tag>
              </Descriptions.Item>
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

            <Flex align="center" gap={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>Режим цены:</Text>
              <Select
                size="small"
                value={selectedProduct.priceMode}
                onChange={(val) => handlePriceModeChange(selectedProduct._id, val)}
                options={priceModeOptions}
                popupMatchSelectWidth={false}
                style={{ minWidth: 110 }}
                labelRender={({ value }) => (
                  <Tag
                    color={priceModeTag[value]}
                    style={{ margin: 0, fontSize: 11 }}
                  >
                    {priceModeLabel[value]}
                  </Tag>
                )}
              />
            </Flex>
          </>
        )}
      </Drawer>
    </div>
  );
}
