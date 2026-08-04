import React from "react";
import { Avatar, Card, Typography, Tooltip } from "antd";
import { TrophyOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Top3CardsProps {
  data: any[];
  loggedInUserId?: number;
}

export const Top3Cards: React.FC<Top3CardsProps> = ({ data, loggedInUserId }) => {
  const top1 = data[0];
  const top2 = data[1];
  const top3 = data[2];

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const renderCard = (student: any, rank: number) => {
    if (!student) return null;

    const isTop1 = rank === 1;
    // Map colors according to design document:
    // #1 (MVP): Purple, #2: Yellow, #3: Green
    const rankColors = {
      1: { color: "#5B21B6", avatarBg: "#5B21B6", badgeText: "MVP", badgeBg: "#F59E0B" },
      2: { color: "#F59E0B", avatarBg: "#F59E0B", badgeText: "Runner Up", badgeBg: "#D1FAE5" },
      3: { color: "#10B981", avatarBg: "#10B981", badgeText: "Bronze", badgeBg: "#DBEAFE" }
    }[rank as 1 | 2 | 3];

    const isMe = student.id === loggedInUserId;
    const height = isTop1 ? 310 : 270;
    const marginTop = isTop1 ? 0 : 40;

    const tooltipContent = (
      <div>
        <div>Reading Score: <b>{student.readingScore}</b></div>
        <div>Coding Score: <b>{student.codingScore}</b></div>
        <div>Essay Score: <b>{student.essayScore}</b></div>
      </div>
    );

    return (
      <Tooltip key={student.id} title={tooltipContent} placement="top">
        <Card
          style={{
            width: 240,
            height: height,
            marginTop: marginTop,
            textAlign: "center",
            borderRadius: 20,
            boxShadow: isTop1 ? "0 12px 32px rgba(91, 33, 182, 0.12)" : "0 8px 20px rgba(0,0,0,0.04)",
            border: isMe ? `3px solid ${rankColors.color}` : "1px solid #E5E7EB",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            cursor: "pointer",
            background: isMe ? "linear-gradient(180deg, #FFFFFF 0%, #EDE9FE40 100%)" : "#FFFFFF",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          styles={{ body: { padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", width: "100%", height: "100%" } }}
          className="top-card-hover"
        >
          {/* Rank Badge Indicator */}
          <div
            style={{
              position: "absolute",
              top: -18,
              left: "50%",
              transform: "translateX(-50%)",
              background: rankColors.color,
              color: "white",
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "900",
              fontSize: 16,
              border: "3px solid white",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              zIndex: 2
            }}
          >
            {rank}
          </div>

          <div style={{ position: "relative", marginBottom: 16, marginTop: 10 }}>
            {/* Avatar Box (Square/Rounded-Square layout) */}
            <Avatar
              shape="square"
              size={isTop1 ? 90 : 75}
              style={{ 
                background: rankColors.avatarBg, 
                color: "#fff", 
                fontSize: isTop1 ? "36px" : "28px", 
                fontWeight: "bold",
                borderRadius: "16px", // Beautiful rounded square "avatar kotak"
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                border: `3px solid ${isMe ? '#FFFFFF' : 'transparent'}`
              }}
            >
              {getInitials(student.name)}
            </Avatar>
            {isTop1 && (
              <div style={{ 
                position: 'absolute', 
                bottom: -8, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                background: '#F59E0B', // Yellow MVP Badge
                color: '#1F2937', 
                padding: '2px 10px', 
                borderRadius: '8px', 
                fontSize: '10px', 
                fontWeight: 'bold', 
                border: '1px solid #fff', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
                whiteSpace: 'nowrap' 
              }}>
                MVP
              </div>
            )}
          </div>

          <Title level={4} style={{ margin: "4px 0 0 0", fontSize: isTop1 ? "18px" : "15px", color: '#1F2937', fontWeight: 800 }}>
            {student.name}
          </Title>
          {isMe && <Text style={{ fontSize: "11px", color: "#5B21B6", fontWeight: 700 }}>It's You!</Text>}
          
          <Text strong style={{ color: "#5B21B6", fontSize: isTop1 ? "22px" : "18px", margin: '6px 0', display: 'block' }}>
            {student.totalScore.toLocaleString("id-ID")} <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>pts</span>
          </Text>

          <div style={{ background: '#F3F4F6', padding: '4px 12px', borderRadius: '50px', display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 'auto' }}>
            {/* Show badge icon or trophy */}
            <TrophyOutlined style={{ color: rankColors.color, fontSize: "12px" }} />
            <Text type="secondary" style={{ fontSize: '11px', fontWeight: 700 }}>
              {isTop1 ? "Gold Master" : student.badgeName || "Warrior"}
            </Text>
          </div>
        </Card>
      </Tooltip>
    );
  };

  return (
    <>
      <style>{`
        .top-card-hover:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 28px rgba(91, 33, 182, 0.08) !important;
        }
      `}</style>
      <div className="flex flex-wrap justify-center items-end gap-4 md:gap-6 mb-10 md:mb-12">
        {renderCard(top2, 2)}
        {renderCard(top1, 1)}
        {renderCard(top3, 3)}
      </div>
    </>
  );
};
