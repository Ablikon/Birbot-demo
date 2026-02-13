import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      locale={ruRU}
      theme={{
        token: {
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          borderRadius: 8,
          colorBgLayout: '#f5f5f5',
          colorBorderSecondary: '#eee',
          controlHeight: 36,
          fontSize: 13,
        },
        components: {
          Layout: {
            siderBg: '#fafafa',
            headerBg: '#fff',
          },
          Menu: {
            itemBorderRadius: 8,
            itemMarginInline: 6,
            itemMarginBlock: 2,
            subMenuItemBg: 'transparent',
            itemSelectedBg: '#e8e8e8',
            itemSelectedColor: '#141414',
            itemHoverBg: '#f0f0f0',
            itemColor: '#595959',
            iconSize: 15,
          },
          Card: {
            paddingLG: 20,
          },
          Table: {
            headerBg: '#fafafa',
            borderColor: '#f0f0f0',
            rowHoverBg: '#fafafa',
            headerSplitColor: '#f0f0f0',
          },
          Button: {
            controlHeight: 34,
            paddingInline: 14,
          },
          Input: {
            controlHeight: 34,
          },
          Select: {
            controlHeight: 34,
          },
          Tabs: {
            inkBarColor: '#141414',
            itemActiveColor: '#141414',
            itemSelectedColor: '#141414',
            itemHoverColor: '#595959',
            itemColor: '#8c8c8c',
          },
        },
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
)
