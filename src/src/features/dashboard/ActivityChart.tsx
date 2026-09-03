import React from "react";
import { Card, Select, DatePicker, Typography, Space } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ActivityData } from "@/src/types/dashboard";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ActivityChartProps {
  data: ActivityData[];
  role: "Admin" | "Pengajar";
  activityClassId: string;
  setActivityClassId: (val: string) => void;
  activityCourseId: string;
  setActivityCourseId: (val: string) => void;
  activityStartDate: string;
  setActivityStartDate: (val: string) => void;
  activityEndDate: string;
  setActivityEndDate: (val: string) => void;
  availableClasses: {label: string, value: string}[];
  availableCourses: {label: string, value: string}[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ 
  data, 
  role,
  activityClassId, setActivityClassId,
  activityCourseId, setActivityCourseId,
  activityStartDate, setActivityStartDate,
  activityEndDate, setActivityEndDate,
  availableClasses, availableCourses
}) => {
  const chartTitle = role === "Admin" ? "Aktivitas Pengguna (Login)" : "Progress Rata-rata Pelajar per Materi";
  const legendLabel = role === "Admin" ? "Jumlah Login" : "Progress Rata-rata (%)";

  return (
    <Card style={{ borderRadius: 12, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <Title level={5} style={{ margin: 0 }}>{chartTitle}</Title>
        <Space wrap>
          {role === "Pengajar" && (
            <Select 
              value={activityCourseId} 
              onChange={setActivityCourseId}
              style={{ width: 140 }} 
              options={[{ value: 'all', label: 'Semua Course' }, ...availableCourses]} 
            />
          )}
          <Select 
            value={activityClassId} 
            onChange={setActivityClassId}
            style={{ width: 140 }} 
            options={[{ value: 'all', label: 'Semua Kelas' }, ...availableClasses]} 
          />
          {role === "Admin" && (
            <RangePicker 
              style={{ width: 220 }} 
              onChange={(dates, dateStrings) => {
                setActivityStartDate(dateStrings[0]);
                setActivityEndDate(dateStrings[1]);
              }}
            />
          )}
        </Space>
      </div>
      
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#f0f0f0" />
            <XAxis dataKey="day" axisLine={true} tickLine={false} stroke="#d9d9d9" tick={{ fill: '#8c8c8c' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c8c8c' }} />
            <Tooltip cursor={{ fill: '#f5f5f5' }} />
            <Bar dataKey="count" fill="#907afa" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <span style={{ display: "inline-block", width: 8, height: 8, backgroundColor: "#907afa", marginRight: 8, borderRadius: 2 }}></span>
          {legendLabel}
        </Text>
      </div>
    </Card>
  );
};
