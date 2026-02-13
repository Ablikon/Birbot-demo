import { Row, Col, Card, Typography, Tag, Space, Button, Flex } from 'antd';
import {
  PlusOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const { Title, Text } = Typography;

const statusLabel = {
  paid: { text: 'Оплачено', color: 'success' },
  unpaid: { text: 'Не оплачено', color: 'error' },
  connected: { text: 'Подключен', color: 'success' },
  not_connected: { text: 'Не подключен', color: 'default' },
};

const marketplaceLabel = {
  kaspi: { name: 'Kaspi', color: 'default' },
  halyk: { name: 'Halyk Market', color: 'default' },
};

export default function Stores() {
  const { stores, activeStore, setActiveStore } = useStore();
  const navigate = useNavigate();

  const handleSelectStore = (store) => {
    setActiveStore(store);
    navigate('/');
  };

  return (
    <div>
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Мои магазины</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Управляйте подключенными магазинами</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/add-store')}
          style={{ fontWeight: 500 }}
        >
          Добавить магазин
        </Button>
      </Flex>

      <Row gutter={[16, 16]}>
        {stores.map((store) => {
          const mp = marketplaceLabel[store.marketplace] || { name: store.marketplace, color: 'default' };
          const isActive = activeStore?.id === store.id;

          return (
            <Col xs={24} sm={12} lg={8} key={store.id}>
              <Card
                className="store-card"
                style={{
                  borderColor: isActive ? '#141414' : undefined,
                  background: isActive ? '#fafafa' : '#fff',
                }}
                onClick={() => handleSelectStore(store)}
              >
                <Flex justify="space-between" align="flex-start" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" size={2}>
                    <Text strong style={{ fontSize: 15 }}>{store.name}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>ID: {store.id}</Text>
                  </Space>
                  <Tag style={{ margin: 0, fontWeight: 500 }}>
                    {mp.name}
                  </Tag>
                </Flex>

                <Flex gap={20} style={{ marginBottom: 14 }}>
                  <Space direction="vertical" size={2}>
                    <Text type="secondary" style={{ fontSize: 11 }}>Бот</Text>
                    <Tag
                      color={statusLabel[store.botStatus]?.color}
                      icon={
                        store.botStatus === 'paid'
                          ? <CheckCircleFilled />
                          : <CloseCircleFilled />
                      }
                      style={{ margin: 0, fontSize: 11 }}
                    >
                      {statusLabel[store.botStatus]?.text}
                    </Tag>
                  </Space>
                  <Space direction="vertical" size={2}>
                    <Text type="secondary" style={{ fontSize: 11 }}>WhatsApp</Text>
                    <Tag
                      color={statusLabel[store.whatsappStatus]?.color}
                      icon={
                        store.whatsappStatus === 'connected'
                          ? <CheckCircleFilled />
                          : <CloseCircleFilled />
                      }
                      style={{ margin: 0, fontSize: 11 }}
                    >
                      {statusLabel[store.whatsappStatus]?.text}
                    </Tag>
                  </Space>
                </Flex>

                <Flex justify="space-between" align="center">
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Товаров: {store.productsCount}
                  </Text>
                  <ArrowRightOutlined style={{ color: '#d9d9d9', fontSize: 11 }} />
                </Flex>
              </Card>
            </Col>
          );
        })}

        {/* Add store card */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            className="add-store-card"
            onClick={() => navigate('/add-store')}
          >
            <Space direction="vertical" align="center" size={6}>
              <PlusOutlined style={{ fontSize: 24, color: '#bfbfbf' }} />
              <Text type="secondary" style={{ fontSize: 13 }}>Добавить магазин</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
