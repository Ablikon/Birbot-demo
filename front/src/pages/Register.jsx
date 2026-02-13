import { useState } from 'react';
import { Card, Form, Input, Button, Typography, Flex, message } from 'antd';
import { UserOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 600));
      register({ name: values.name, phone: values.phone, password: values.password });
      message.success('Аккаунт успешно создан');
      window.location.href = '/stores';
    } catch {
      message.error('Ошибка регистрации');
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
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Создать аккаунт</Title>
            <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: 'block' }}>
              Заполните данные для регистрации
            </Text>
          </div>

          <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Введите ваше имя' }]}
            >
              <Input
                prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Имя"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              rules={[{ required: true, message: 'Введите номер телефона' }]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Номер телефона"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Введите пароль' },
                { min: 6, message: 'Минимум 6 символов' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Пароль"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Подтвердите пароль' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Пароли не совпадают'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Подтвердите пароль"
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
                Зарегистрироваться
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Уже есть аккаунт?{' '}
              <Link to="/login" style={{ fontWeight: 500 }}>
                Войти
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
