import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

const StudentFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter
      style={{
        textAlign: 'center',
        background: '#ffffff',
        padding: '24px 0',
        borderTop: '1px solid #f0f0f0'
      }}
    >
      <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
        ©Copyright {currentYear} BAJAPRO. All Rights Reserved
      </Text>
    </AntFooter>
  );
};

export default StudentFooter;
