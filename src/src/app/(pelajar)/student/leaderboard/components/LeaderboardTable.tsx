import React, { useState } from "react";
import { Table, Button, Input, Space, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface LeaderboardTableProps {
  data: any[];
  loading: boolean;
  loggedInUserId?: number;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ data, loading, loggedInUserId }) => {
  const [searchText, setSearchText] = useState("");

  const tableData = data
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }))
    .slice(3) // Start from index 3 (Rank 4)
    .filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()));

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      align: "center" as const,
      render: (rank: number) => (
        <div style={{ background: '#F3F4F6', color: '#4B5563', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', margin: '0 auto' }}>
            {rank}
        </div>
      )
    },
    {
      title: "Nama Siswa",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => {
        const isMe = record.id === loggedInUserId;
        return (
          <Space size="middle">
            <div style={{ padding: 2, background: isMe ? 'linear-gradient(135deg, #722ED1 0%, #1677FF 100%)' : 'transparent', borderRadius: '50%' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: isMe ? '#531DAB' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isMe ? '#fff' : '#4B5563', fontWeight: 'bold', fontSize: '16px', border: '2px solid #fff' }}>
                    {getInitials(name)}
                </div>
            </div>
            <Text strong={isMe} style={{ color: isMe ? '#531DAB' : '#1F2937', fontSize: '15px' }}>
                {name} {isMe && <span style={{ fontSize: '12px', background: '#F0F5FF', padding: '2px 8px', borderRadius: '12px', marginLeft: 8 }}>You</span>}
            </Text>
          </Space>
        );
      }
    },
    {
      title: "Badge",
      key: "badge",
      render: (_: any, record: any) => (
        <Space style={{ background: '#F8FAFC', padding: '4px 12px', borderRadius: '50px', border: '1px solid #E2E8F0' }}>
          {record.badgeImage && <img src={record.badgeImage} alt="badge" width={20} style={{ objectFit: 'contain' }} />}
          <Text style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{record.badgeName}</Text>
        </Space>
      ),
    },
    {
      title: "Reading",
      dataIndex: "readingScore",
      key: "readingScore",
      align: "center" as const,
      render: (val: number) => <Text type="secondary">{val}</Text>
    },
    {
      title: "Coding",
      dataIndex: "codingScore",
      key: "codingScore",
      align: "center" as const,
      render: (val: number) => <Text type="secondary">{val}</Text>
    },
    {
      title: "Essay",
      dataIndex: "essayScore",
      key: "essayScore",
      align: "center" as const,
      render: (val: number) => <Text type="secondary">{val}</Text>
    },
    {
      title: "Total Score",
      dataIndex: "totalScore",
      key: "totalScore",
      align: "center" as const,
      render: (score: number) => <Text style={{ color: '#531DAB', fontWeight: 800, fontSize: '16px' }}>{score}</Text>
    },
  ];

  return (
    <div style={{ backgroundColor: "white", padding: 16, borderRadius: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <Text strong style={{ fontSize: '16px', color: '#374151' }}>Other Rankings 👥</Text>
        <Input 
          placeholder="Cari nama siswa..." 
          prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />} 
          className="w-full sm:w-72"
          style={{ borderRadius: 12, padding: '8px 16px' }} 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table 
        className="leaderboard-table"
        columns={columns} 
        dataSource={tableData} 
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10, position: ['bottomCenter'] }}
        scroll={{ x: 'max-content' }}
        rowClassName={(record) => record.id === loggedInUserId ? "highlight-row" : ""}
      />
      <style>{`
        .leaderboard-table .ant-table-thead > tr > th {
          background-color: #F8FAFC !important;
          color: #64748B !important;
          font-weight: 600 !important;
          border-bottom: 2px solid #E2E8F0 !important;
        }
        .leaderboard-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #F1F5F9 !important;
          padding: 16px 16px !important;
        }
        .highlight-row {
          background-color: #F0F5FF !important;
          transition: all 0.3s ease;
        }
        .highlight-row:hover {
          background-color: #E6F4FF !important;
        }
        .highlight-row td {
          border-top: 1px solid #BAE0FF !important;
          border-bottom: 1px solid #BAE0FF !important;
        }
        .highlight-row td:first-child {
          border-left: 3px solid #1677FF !important;
        }
      `}</style>
    </div>
  );
};
