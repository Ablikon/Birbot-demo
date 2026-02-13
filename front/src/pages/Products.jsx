import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Table,
  Input,
  InputNumber,
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
  Spin,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  ExportOutlined,
  FilterOutlined,
  EditOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useStore } from '../context/StoreContext';
import { productAPI } from '../services/api';

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

export default function Products() {
  const { activeStore } = useStore();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [pageSize, setPageSize] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [editingCell, setEditingCell] = useState(null); // { id, field }
  const [editingValue, setEditingValue] = useState(null);

  // Map tab keys to API filter values
  const tabFilterMap = {
    active: 'all',
    inactive: 'archive',
  };

  const fetchProducts = useCallback(async () => {
    if (!activeStore?.id) return;
    setLoading(true);
    try {
      const { data } = await productAPI.getList(activeStore.id, {
        filter: tabFilterMap[activeTab] || 'all',
        page: currentPage,
        limit: pageSize,
        q: search,
      });
      // API returns { data: [...] } or just array
      const list = Array.isArray(data) ? data : (data.data || []);
      setProducts(list);
      setTotal(data.total || list.length);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      message.error('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  }, [activeStore?.id, activeTab, currentPage, pageSize, search]);

  const fetchStats = useCallback(async () => {
    if (!activeStore?.id) return;
    try {
      const { data } = await productAPI.getStats(activeStore.id);
      setStats(data);
    } catch {
      // Stats may fail silently
    }
  }, [activeStore?.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  const handlePriceModeChange = async (productId, mode) => {
    try {
      const updateData = {
        isDemping: mode === 'demping',
        isAutoRaise: mode === 'raise',
      };
      await productAPI.update(productId, updateData);
      const labels = { demping: 'Снижение включено', raise: 'Повышение включено', off: 'Режим выключен' };
      message.success(labels[mode]);
      fetchProducts();
    } catch {
      message.error('Ошибка обновления');
    }
  };

  const startEditing = (id, field, currentValue) => {
    setEditingCell({ id, field });
    setEditingValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditingValue(null);
  };

  const savePrice = async () => {
    if (!editingCell) return;
    const { id, field } = editingCell;
    try {
      await productAPI.update(id, { [field]: editingValue });
      message.success('Цена обновлена');
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, [field]: editingValue } : p))
      );
    } catch {
      message.error('Ошибка обновления цены');
    } finally {
      cancelEditing();
    }
  };

  const renderEditablePrice = (value, record, field, suffix = '') => {
    const isEditing = editingCell?.id === record._id && editingCell?.field === field;
    if (isEditing) {
      return (
        <InputNumber
          size="small"
          autoFocus
          value={editingValue}
          onChange={setEditingValue}
          onPressEnter={savePrice}
          onBlur={savePrice}
          min={0}
          style={{ width: '100%' }}
          controls={false}
        />
      );
    }
    return (
      <Text
        style={{ fontSize: 13, cursor: 'pointer', fontWeight: field === 'price' ? 600 : 400, color: field === 'price' ? undefined : '#888' }}
        onClick={() => startEditing(record._id, field, value)}
      >
        {value ? `${value.toLocaleString('ru-RU')}${suffix}` : '—'}
        <EditOutlined style={{ marginLeft: 4, fontSize: 11, color: '#bbb' }} />
      </Text>
    );
  };

  const openDetail = (product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  };

  const tabItems = [
    { key: 'active', label: `Активные (${(stats.all || 0) - (stats.archive || 0)})` },
    { key: 'inactive', label: `Неактивные (${stats.archive || 0})` },
  ];

  const priceModeOptions = [
    { value: 'demping', label: 'Снижение' },
    { value: 'raise', label: 'Повышение' },
    { value: 'off', label: 'Выкл' },
  ];

  const getPriceModeValue = (record) => {
    if (record.isDemping) return 'demping';
    if (record.isAutoRaise) return 'raise';
    return 'off';
  };

  const priceModeTag = { demping: 'green', raise: 'blue', off: 'default' };
  const priceModeLabel = { demping: 'Снижение', raise: 'Повышение', off: 'Выкл' };

  const columns = [
    ...(isMobile ? [] : [
      {
        title: 'Мин.',
        dataIndex: 'availableMinPrice',
        key: 'minPrice',
        width: 100,
        render: (v, record) => renderEditablePrice(v, record, 'availableMinPrice'),
      },
    ]),
    {
      title: 'Товар',
      key: 'product',
      width: isMobile ? 200 : 320,
      fixed: isMobile ? 'left' : undefined,
      render: (_, record) => (
        <Flex gap={10} align="center">
          <Avatar
            shape="square"
            size={isMobile ? 36 : 40}
            src={record.img}
            style={{ borderRadius: 8, flexShrink: 0, cursor: 'pointer' }}
            onClick={() => openDetail(record)}
          />
          <div style={{ minWidth: 0 }}>
            <Text
              strong
              style={{ fontSize: 13, display: 'block', cursor: 'pointer', lineHeight: 1.4 }}
              ellipsis={{ tooltip: record.name }}
              onClick={() => openDetail(record)}
            >
              {record.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.sku || record.masterProductSku}
            </Text>
          </div>
        </Flex>
      ),
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (v, record) => renderEditablePrice(v, record, 'price', ' ₸'),
    },
    ...(isMobile ? [] : [
      {
        title: 'Шаг',
        dataIndex: 'dempingPrice',
        key: 'step',
        width: 80,
        render: (v) => <Text style={{ fontSize: 13 }}>{v || '—'}</Text>,
      },
    ]),
    {
      title: 'Позиция',
      dataIndex: 'place',
      key: 'position',
      width: 95,
      align: 'center',
      sorter: (a, b) => (a.place || 99) - (b.place || 99),
      render: (v) => v ? (
        <Tag
          color={v <= 3 ? 'green' : v <= 10 ? 'gold' : 'default'}
          style={{ margin: 0, minWidth: 32, textAlign: 'center' }}
        >
          {v}
        </Tag>
      ) : '—',
    },
    {
      title: 'Режим',
      key: 'priceMode',
      width: isMobile ? 95 : 120,
      align: 'center',
      render: (_, record) => (
        <Select
          size="small"
          value={getPriceModeValue(record)}
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
        <Button
          icon={<ReloadOutlined />}
          style={{ fontWeight: 500 }}
          block={isMobile}
          onClick={() => { fetchProducts(); fetchStats(); }}
          loading={loading}
        >
          Обновить
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

        {/* Search */}
        <div style={{ padding: isMobile ? '10px 12px' : '12px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <Flex gap={10} align="center" wrap="wrap">
            <Input
              placeholder="Найти товар..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ flex: isMobile ? '1 1 100%' : '0 1 260px' }}
              variant="filled"
            />
            <div style={{ flex: 1 }} />
            <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
              {total} товаров
            </Text>
          </Flex>
        </div>

        <Spin spinning={loading}>
          <Table
            dataSource={products}
            columns={columns}
            rowKey="_id"
            size="small"
            scroll={{ x: isMobile ? 500 : undefined }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: (page, size) => { setCurrentPage(page); setPageSize(size); },
              showSizeChanger: !isMobile,
              pageSizeOptions: ['10', '15', '30', '50'],
              size: 'small',
              style: { padding: '0 12px' },
              simple: isMobile,
            }}
            rowSelection={isMobile ? undefined : { type: 'checkbox' }}
          />
        </Spin>
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
              href={selectedProduct.url}
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
            {selectedProduct.img && (
              <div style={{ textAlign: 'center', marginBottom: 16, background: '#fafafa', borderRadius: 12, padding: 20 }}>
                <Image
                  src={selectedProduct.img}
                  width={160}
                  style={{ borderRadius: 10 }}
                />
              </div>
            )}

            <Card size="small" style={{ marginBottom: 16 }} styles={{ body: { padding: 14 } }}>
              <Descriptions column={2} size="small" colon={false}>
                <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Цена</Text>} span={1}>
                  <Text strong>{selectedProduct.price?.toLocaleString('ru-RU')} ₸</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Шаг</Text>} span={1}>
                  {selectedProduct.dempingPrice || '—'} ₸
                </Descriptions.Item>
                <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Мин. цена</Text>} span={1}>
                  {selectedProduct.availableMinPrice?.toLocaleString('ru-RU') || '—'} ₸
                </Descriptions.Item>
                <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Макс. цена</Text>} span={1}>
                  {selectedProduct.availableMaxPrice?.toLocaleString('ru-RU') || '—'} ₸
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Descriptions column={1} size="small" colon={false}>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Артикул</Text>}>{selectedProduct.sku || selectedProduct.masterProductSku}</Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Позиция</Text>}>
                {selectedProduct.place ? (
                  <Tag color={selectedProduct.place <= 3 ? 'green' : selectedProduct.place <= 10 ? 'gold' : 'default'} style={{ fontSize: 12 }}>
                    {selectedProduct.place} место
                  </Tag>
                ) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Бонус</Text>}>{selectedProduct.bonus || '—'}%</Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Рассрочка</Text>}>{selectedProduct.loanPeriod || '—'} мес</Descriptions.Item>
              <Descriptions.Item label={<Text type="secondary" style={{ fontSize: 12 }}>Статус</Text>}>
                <Tag color={selectedProduct.isActive ? 'success' : 'default'} style={{ fontSize: 11 }}>
                  {selectedProduct.isActive ? 'Активный' : 'Архив'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: '14px 0' }} />

            <Flex align="center" gap={12}>
              <Text type="secondary" style={{ fontSize: 12 }}>Режим цены:</Text>
              <Select
                size="small"
                value={getPriceModeValue(selectedProduct)}
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
