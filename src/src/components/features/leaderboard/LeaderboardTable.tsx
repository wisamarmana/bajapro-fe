import React, { useState } from "react";
import { Table, Button, Input, Space, Typography } from "antd";
import { FileExcelOutlined, FilePdfOutlined, SearchOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const { Text } = Typography;

interface LeaderboardTableProps {
  data: any[];
  loading: boolean;
  loggedInUserId?: number;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ data, loading }) => {
  const [searchText, setSearchText] = useState("");

  const tableData = data
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }))
    .slice(3) // Start from index 3 (Rank 4)
    .filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()));

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 80,
    },
    {
      title: "Nama",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Badge",
      key: "badge",
      render: (_: any, record: any) => (
        <Space>
          {record.badgeImage && <img src={record.badgeImage} alt="badge" width={24} />}
          <Text>{record.badgeName}</Text>
        </Space>
      ),
    },
    {
      title: "Reading Score",
      dataIndex: "readingScore",
      key: "readingScore",
      align: "center" as const,
    },
    {
      title: "Exploring Score",
      dataIndex: "codingScore",
      key: "codingScore",
      align: "center" as const,
    },
    {
      title: "Essay Score",
      dataIndex: "essayScore",
      key: "essayScore",
      align: "center" as const,
    },
    {
      title: "Total Score",
      dataIndex: "totalScore",
      key: "totalScore",
      align: "center" as const,
      render: (score: number) => <Text strong>{score}</Text>
    },
  ];

  const handleExportExcel = () => {
    // Export all data, not just tableData
    const exportData = data.map((item, index) => ({
      Rank: index + 1,
      Nama: item.name,
      Badge: item.badgeName,
      "Reading Score": item.readingScore,
      "Coding Score": item.codingScore,
      "Essay Score": item.essayScore,
      "Total Score": item.totalScore
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leaderboard");
    XLSX.writeFile(workbook, "Leaderboard.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Leaderboard", 14, 15);

    const tableColumn = ["Rank", "Nama", "Badge", "Reading Score", "Coding Score", "Essay Score", "Total Score"];
    const tableRows: any[] = [];

    data.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.name,
        item.badgeName,
        item.readingScore,
        item.codingScore,
        item.essayScore,
        item.totalScore
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("Leaderboard.pdf");
  };

  return (
    <div style={{ backgroundColor: "white", padding: 24, borderRadius: 16 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 16,
        flexWrap: "wrap",
        gap: 16
      }}>
        <Space wrap>
          <Button type="primary" style={{ backgroundColor: "#52C41A" }} icon={<FileExcelOutlined />} onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button type="primary" danger icon={<FilePdfOutlined />} onClick={handleExportPDF}>
            Export PDF
          </Button>
        </Space>
        <Input
          placeholder="Cari..."
          prefix={<SearchOutlined />}
          style={{ width: 250, borderRadius: 8 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};
