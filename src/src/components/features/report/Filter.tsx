"use client";
import { Card, Select, Button, Typography, message, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reportApi } from "@/src/actions/report/reportApi";
import { CourseRecord } from "@/src/types/course";
import { ClassData } from "@/src/types/kelas";
import { useAuth } from "@/src/hooks/useAuth";

export default function Filter() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Gunakan undefined supaya placeholder di Select muncul
  const [selected, setSelected] = useState<{ class?: string; course?: string }>({ 
    class: undefined, 
    course: undefined 
  });
  
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        
        let resClasses;
        let isPengajar = false;
        let userId = null;
        
        if (user) {
          if (user.role_id === 2 || user.role === "Pengajar" || user.role_id === "2") {
            isPengajar = true;
            userId = user.id;
          }
        }

        if (isPengajar && userId) {
          resClasses = await reportApi.getClassesByTeacher(userId);
        } else {
          resClasses = await reportApi.getClasses();
        }

        const resCourses = await reportApi.getCourses();
        
        setClasses(resClasses || []);
        setCourses(resCourses || []);
      } catch (error) {
        console.error("Error fetching filter data:", error);
        message.error("Gagal mengambil data filter dari server");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleExecute = () => {
    if (selected.class && selected.course) {
      // 1. Cari nama kelas dan course dari state yang sudah ada
      const className = classes.find((c) => String(c.id) === selected.class)?.class_name;
      const courseName = courses.find((c) => String(c.id) === selected.course)?.course_name;
      
      // 2. Kirim nama tersebut lewat URL parameter
      router.push(
        `/report/${selected.class}?course=${selected.course}&className=${className}&courseName=${courseName}`
      );
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div
        className="flex justify-between items-center mb-6 shadow-sm"
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
        }}
      >
        <Typography.Text >Silahkan pilih filter untuk melihat laporan</Typography.Text>
        <Button 
          type="primary" 
          size="large"
          disabled={!selected.class || !selected.course}
          onClick={handleExecute}
        >
          Execute
        </Button>
      </div>
    
      {/* Filter Card */}
      <Card className="shadow-sm" style={{ borderRadius: '8px' }}>
        <Typography.Title level={4} style={{marginBottom: '16px'}}>Filter Laporan</Typography.Title>
        
        <Spin spinning={loading}>
          <div className="flex flex-col gap-4">
            <div>
              <Typography.Text type="secondary">Pilih Course:</Typography.Text>
              <Select 
                placeholder="Pilih Course" 
                style={{ width: '100%', marginTop: '8px' }} 
                value={selected.course}
                onChange={(v) => setSelected({ ...selected, course: v })}
                options={courses.map((c) => ({ 
                  label: c.course_name, 
                  value: String(c.id) 
                }))} 
              />
            </div>
            <div>
              <Typography.Text type="secondary">Pilih Kelas:</Typography.Text>
              <Select 
                placeholder="Pilih Kelas" 
                style={{ width: '100%', marginTop: '8px' }} 
                value={selected.class}
                onChange={(v) => setSelected({ ...selected, class: v })}
                options={[
                  ...(user?.role_id === 1 ? [{ label: "Tanpa Kelas / Umum", value: "none" }] : []),
                  ...classes.map((c) => ({ 
                    label: c.class_name, 
                    value: String(c.id) 
                  }))
                ]} 
              />
            </div>
          </div>
        </Spin>
      </Card>
    </div>
  );
}
