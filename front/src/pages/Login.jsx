import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Flex, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login({ email: values.email, password: values.password });
      message.success('Вы успешно вошли');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Неверный логин или пароль';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo */}
        <Flex justify="center" style={{ marginBottom: 32 }}>
          <Flex align="center" gap={10}>
            <div className="auth-logo-icon">B</div>
            <span className="auth-logo-text">birbot</span>
          </Flex>
        </Flex>

        <Card className="auth-card" styles={{ body: { padding: '32px 28px' } }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Вход в аккаунт</Title>
            <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: 'block' }}>
              Введите данные для входа
            </Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
            <Form.Item
              name="email"
              rules={[{ required: true, message: 'Введите логин' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Логин"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Введите пароль' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Пароль"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="auth-submit-btn"
              >
                Войти
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Нет аккаунта?{' '}
              <Link to="/register" style={{ fontWeight: 500 }}>
                Зарегистрироваться
              </Link>
            </Text>
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            © {new Date().getFullYear()} Birbot. Все права защищены.
          </Text>
        </div>
      </div>
    </div>
  );
}
