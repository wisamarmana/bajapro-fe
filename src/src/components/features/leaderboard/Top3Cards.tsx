import React from "react";
import { Avatar, Card, Typography, Tooltip } from "antd";

const { Title, Text } = Typography;

interface Top3CardsProps {
  data: any[];
  loggedInUserId?: number;
}

export const Top3Cards: React.FC<Top3CardsProps> = ({ data }) => {
  // Data should be pre-sorted descending by score.
  const top1 = data[0];
  const top2 = data[1];
  const top3 = data[2];

  const renderCard = (student: any, rank: number) => {
    if (!student) return null;

    const isTop1 = rank === 1;
    const badgeColor = rank === 1 ? "#531DAB" : rank === 2 ? "#FAAD14" : "#52C41A";
    const height = isTop1 ? 280 : 240;
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
        <div style={{ position: "relative" }}>
          <Card
            style={{
              width: 220,
              minHeight: height,
              marginTop: marginTop,
              textAlign: "center",
              borderRadius: 16,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              border: `2px solid ${badgeColor}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer"
            }}
            styles={{ body: { padding: "20px 10px" } }}
          >
            <div
              style={{
                position: "absolute",
                top: -15,
                right: -15,
                backgroundColor: badgeColor,
                color: "white",
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontWeight: "bold",
                fontSize: 18,
                border: "3px solid white",
                zIndex: 1
              }}
            >
              #{rank}
            </div>
            <Avatar
              size={isTop1 ? 100 : 80}
              style={{ backgroundColor: badgeColor, margin: "0 auto 16px auto", color: "white", display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: isTop1 ? '2rem' : '1.5rem', border: '2px solid white' }}
            >
              {student.name ? student.name.substring(0, 2).toUpperCase() : "S"}
            </Avatar>
            <Title level={4} style={{ margin: 0, fontSize: isTop1 ? 20 : 18 }}>
              {student.name}
            </Title>
            
            <div style={{
              padding: "4px 16px",
              borderRadius: 20,
              display: "inline-flex",
              alignItems: "baseline",
              gap: 4,
              marginBottom: 16
            }}>
              <Text style={{ fontWeight: 900, fontSize: isTop1 ? 32 : 28, color: "#111827" }}>
                {student.totalScore}
              </Text>
              <Text style={{ fontWeight: 700, fontSize: 12, color: "#6B7280" }}>PTS</Text>
            </div>

            {/* Badge Pill */}
            <div style={{
              backgroundColor: badgeColor,
              color: "#fff",
              padding: "4px 16px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}>
              {student.badgeImage ? (
                <img src={student.badgeImage} alt="badge" width={16} height={16} />
              ) : (
                <span>🏅</span>
              )}
              {student.badgeName || "Bronze Coder"}
            </div>

            {/* Detail Scores */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginTop: 14, paddingTop: 12, borderTop: "1px dashed #E5E7EB", width: "100%", gap: 4
            }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Read</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#1F2937" }}>{student.readingScore || 0}</span>
              </div>
              <div style={{ width: 1, height: 16, backgroundColor: "#E5E7EB" }} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Explore</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#1F2937" }}>{student.codingScore || 0}</span>
              </div>
              <div style={{ width: 1, height: 16, backgroundColor: "#E5E7EB" }} />
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Essay</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#1F2937" }}>{student.essayScore || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </Tooltip>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-start",
        gap: 16,
        marginBottom: 64,
        marginTop: 40,
        flexWrap: "nowrap",
        alignItems: "center",
        overflowX: "auto",
        paddingTop: 24,
        paddingBottom: 24,
        paddingLeft: 16,
        paddingRight: 16,
        width: "100%",
        scrollbarWidth: "none"
      }}
      className="top3-cards-container"
    >
      <style>{`
        .top3-cards-container::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 768px) {
          .top3-cards-container {
             justify-content: center !important;
             gap: 32px !important;
          }
        }
      `}</style>
      <div style={{ flexShrink: 0 }}>{renderCard(top2, 2)}</div>
      <div style={{ flexShrink: 0 }}>{renderCard(top1, 1)}</div>
      <div style={{ flexShrink: 0 }}>{renderCard(top3, 3)}</div>
    </div>
  );
};
