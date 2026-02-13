import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Typography,
  Input,
  Button,
  Segmented,
  Space,
  Flex,
  Steps,
  Grid,
  message,
  Result,
} from 'antd';
import {
  ArrowLeftOutlined,
  MobileOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

export default function AddStore() {
  const navigate = useNavigate();
  const { addStore } = useStore();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [marketplace, setMarketplace] = useState('kaspi');
  const [step, setStep] = useState(0); // 0=phone, 1=code, 2=done
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  // Countdown timer for SMS
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatCountdown = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSendCode = () => {
    if (!phone || phone.length < 10) {
      message.error('Введите корректный номер телефона');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep(1);
      setCountdown(60);
      message.success('SMS код отправлен');
    }, 1200);
  };

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      message.error('Введите полный код');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addStore({
        name: `Магазин ${phone}`,
        marketplace,
      });
      setStep(2);
    }, 1500);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newCode = [...code];
      for (let i = 0; i < pasted.length; i++) {
        newCode[i] = pasted[i];
      }
      setCode(newCode);
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', paddingTop: isMobile ? 0 : 20 }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/stores')}
        style={{ marginBottom: 12, color: '#8c8c8c', fontWeight: 500 }}
      >
        Назад
      </Button>

      <Card styles={{ body: { padding: isMobile ? 16 : 24 } }}>
        <Title level={4} style={{ textAlign: 'center', marginBottom: isMobile ? 16 : 24, fontWeight: 600, fontSize: isMobile ? 18 : undefined }}>
          Добавление магазина
        </Title>

        {/* Marketplace selector */}
        <Flex justify="center" style={{ marginBottom: isMobile ? 16 : 24 }}>
          <Segmented
            value={marketplace}
            onChange={setMarketplace}
            options={[
              { label: 'Kaspi', value: 'kaspi' },
              { label: 'Halyk Market', value: 'halyk' },
            ]}
            disabled={step > 0}
            block={isMobile}
            style={isMobile ? { width: '100%' } : undefined}
          />
        </Flex>

        {/* Steps indicator */}
        <Steps
          current={step}
          size="small"
          style={{ marginBottom: isMobile ? 20 : 32 }}
          items={[
            { title: 'Телефон', icon: <MobileOutlined /> },
            { title: 'Код', icon: <SafetyOutlined /> },
            { title: 'Готово', icon: <CheckCircleOutlined /> },
          ]}
        />

        {/* Step 0: Phone */}
        {step === 0 && (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
                Номер телефона
              </Text>
              <Input
                size="large"
                placeholder="+7 (___) ___ ____"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ fontSize: 16 }}
                maxLength={18}
              />
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              На этот номер будет отправлен SMS-код для подтверждения
            </Text>
            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleSendCode}
            >
              Добавить магазин
            </Button>
          </Space>
        )}

        {/* Step 1: Code */}
        {step === 1 && (
          <Space direction="vertical" size={16} style={{ width: '100%' }} align="center">
            <Text style={{ textAlign: 'center', display: 'block' }}>
              Введите код из SMS на <Text strong>{phone}</Text>
            </Text>

            {countdown > 0 && (
              <Text style={{ fontSize: 18, fontWeight: 600, color: '#141414' }}>
                {formatCountdown(countdown)}
              </Text>
            )}

            <Flex gap={isMobile ? 6 : 8} justify="center" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <Input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  style={{
                    width: isMobile ? 42 : 48,
                    height: isMobile ? 46 : 52,
                    textAlign: 'center',
                    fontSize: isMobile ? 18 : 20,
                    fontWeight: 600,
                    borderRadius: 10,
                  }}
                  maxLength={1}
                />
              ))}
            </Flex>

            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleVerify}
              style={{ maxWidth: 320 }}
            >
              Подтвердить
            </Button>

            {countdown <= 0 && (
              <Button type="link" onClick={handleSendCode} size="small">
                Отправить код повторно
              </Button>
            )}
          </Space>
        )}

        {/* Step 2: Success */}
        {step === 2 && (
          <Result
            status="success"
            title="Магазин добавлен"
            subTitle="Товары будут синхронизированы в ближайшее время"
            extra={[
              <Button
                type="primary"
                key="stores"
                onClick={() => navigate('/stores')}
              >
                К магазинам
              </Button>,
              <Button key="dashboard" onClick={() => navigate('/')}>
                На главную
              </Button>,
            ]}
          />
        )}
      </Card>
    </div>
  );
}
