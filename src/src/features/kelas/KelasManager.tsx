"use client";

import { ClassTable } from "@/src/features/kelas/ClassTable";
import { useClass } from "@/src/hooks/kelas/useClass";
import { useAuth } from "@/src/hooks/useAuth";
import { ClassData } from "@/src/types/kelas";
import {
    FilterOutlined,
    PlusOutlined,
    SearchOutlined,
    ThunderboltOutlined
} from "@ant-design/icons";
import {
    Button,
    Card,
    Descriptions,
    Form,
    Input,
    Modal,
    Popover,
    Select,
    Space,
    Table,
    Tag,
    Typography
} from "antd";
import { useState } from "react";

const { Title } = Typography;

export default function KelasManager() {
  const { can, user } = useAuth();
  const { 
    kelas, 
    guruOptions, 
    loading, 
    addKelas, 
    editKelas, 
    deleteKelas, 
    contextHolder 
  } = useClass();
  
  const [form] = Form.useForm();

  const currentUserRole = user?.role_id === 1 ? "Admin" : "Pengajar";
  const currentUserId = user?.id ?? null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewData, setViewData] = useState<ClassData | null>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [filterGuru, setFilterGuru] = useState<string | null>(null);
  const [filterSekolah, setFilterSekolah] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // MENDAPATKAN DAFTAR NAMA SEKOLAH UNIK DARI DATA UNTUK DROPDOWN
  const safeKelas = Array.isArray(kelas) ? kelas : [];

  const uniqueSchools = Array.from(new Set(safeKelas.map((k) => k.school_name))).map((school) => ({
    value: school,
    label: school,
  }));

  const filteredKelas = safeKelas.filter((k) => {
    // 1. Jika Pengajar, hanya tampilkan kelas buatannya (berdasarkan teacher_id)
    if (currentUserRole === "Pengajar" && Number(k.teacher_id) !== Number(currentUserId)) {
      return false;
    }

    // 2. Filter Pencarian Nama Kelas (berdasarkan class_name)
    if (searchText && !k.class_name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }

    // 3. Filter Guru hanya untuk Admin (berdasarkan teacher_name)
    if (currentUserRole === "Admin" && filterGuru && k.teacher_name !== filterGuru) {
      return false;
    }

    // 4. Filter Sekolah (Bisa dipakai Admin dan Pengajar)
    if (filterSekolah && k.school_name !== filterSekolah) {
      return false;
    }

    return true;
  });

  const handleAction = (action: "add" | "edit" | "view", record?: ClassData) => {
    setModalMode(action);
    setSelectedId(record?.id.toString() || null);
    setIsModalOpen(true);
    
    if (action === "view" && record) {
      setViewData(record);
      setStudentsLoading(true);
      fetch(`/api/users?class_id=${record.id}&role_id=3`)
        .then(res => res.json())
        .then(data => setClassStudents(data))
        .catch(err => console.error(err))
        .finally(() => setStudentsLoading(false));
    } else {
      setViewData(null);
      setClassStudents([]);
      if (action === "add") {
        form.resetFields();
      } else if (record) {
        setTimeout(() => form.setFieldsValue(record), 50);
      }
    }
  };

  const handleSimpan = async () => {
    try {
      const values = await form.validateFields();
      let success = false;
      
      // Inject teacher_id from logged in user if not present
      const submitData = {
        ...values,
        teacher_id: values.teacher_id || currentUserId,
      };
      
      if (modalMode === "add") {
        success = await addKelas(submitData);
      } else if (modalMode === "edit" && selectedId) {
        success = await editKelas(selectedId, submitData);
      }
      
      if (success) {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.log("Validasi form gagal", error);
    }
  };

  const handleGenerateKode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldsValue({ class_code: result });
  };

  const filterContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "220px" }}>
      
      {/* Hanya tampilkan filter Guru kalau yang login Admin */}
      {currentUserRole === "Admin" && (
        <div>
          <Typography.Text strong>Nama Guru</Typography.Text>
          <Select 
            style={{ width: "100%", marginTop: "4px" }} 
            placeholder="Semua Guru" 
            allowClear 
            value={filterGuru} 
            onChange={setFilterGuru} 
            options={guruOptions}
          />
        </div>
      )}

      {/* Filter Sekolah */}
      {currentUserRole === "Admin" && (
        <div>
          <Typography.Text strong>Nama Sekolah</Typography.Text>
          <Select 
            style={{ width: "100%", marginTop: "4px" }} 
            placeholder="Semua Sekolah" 
            allowClear 
            value={filterSekolah} 
            onChange={setFilterSekolah} 
            options={uniqueSchools}
          />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", flexWrap: "wrap", gap: "8px" }}>
        <Button 
          type="dashed" 
          onClick={() => {
            setFilterGuru(null);
            setFilterSekolah(null);
          }}
        >
          Reset
        </Button>
        <Button 
          type="primary" 
          style={{ backgroundColor: "#7246BA" }} 
          onClick={() => setIsFilterOpen(false)}
        >
          Terapkan
        </Button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <Card style={{ borderRadius: "12px", padding: "12px" }}>
        <Title level={3} style={{ marginBottom: "4px" }}>List Kelas</Title>
        <p style={{ color: "gray", marginTop: "0px", marginBottom: "24px" }}>
          Kelola kelas untuk mengelompokkan murid Anda
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
          {can("kelas.create") && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              size="large" 
              style={{ backgroundColor: "#7246BA", borderRadius: "8px" }} 
              onClick={() => handleAction("add")}
            >
              Tambah Kelas
            </Button>
          )}
          <Space>
            <Input 
              size="large" 
              placeholder="Cari Nama Kelas" 
              prefix={<SearchOutlined />} 
              style={{ borderRadius: "8px", width: "250px" }} 
              value={searchText} 
              onChange={(e) => setSearchText(e.target.value)} 
            />
            
            {currentUserRole === "Admin" && (
              <Popover 
                content={filterContent} 
                title="Filter Data" 
                trigger="click" 
                open={isFilterOpen} 
                onOpenChange={setIsFilterOpen} 
                placement="bottomRight"
              >
                <Button size="large" icon={<FilterOutlined />} style={{ borderRadius: "8px" }}>
                  Filter
                </Button>
              </Popover>
            )}
          </Space>
        </div>

        <ClassTable 
          data={filteredKelas} 
          loading={loading} 
          role={currentUserRole}
          onAction={handleAction} 
          onDelete={deleteKelas} 
        />
      </Card>

      <Modal
        title={
          <span style={{ color: "#7246BA", fontSize: "20px", fontWeight: "bold" }}>
            {modalMode === "add" ? "Tambah Kelas" : modalMode === "edit" ? "Edit Kelas" : "Detail Kelas"}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        footer={
          modalMode === "view" ? (
            <Button size="large" onClick={() => setIsModalOpen(false)}>
              Tutup
            </Button>
          ) : (
            <Space>
              <Button size="large" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button 
                size="large" 
                type="primary" 
                style={{ backgroundColor: "#7246BA" }} 
                onClick={handleSimpan} 
                loading={loading}
              >
                Simpan
              </Button>
            </Space>
          )
        }
      >
        {modalMode === "view" ? (
          viewData ? (
            <div>
              <Descriptions column={1} bordered style={{ marginTop: "24px", marginBottom: "24px" }}>
                <Descriptions.Item label="Nama Kelas">
                  <strong>{viewData.class_name}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Kode Kelas">
                  <Tag color="purple" style={{ fontSize: "14px", padding: "4px 8px" }}>
                    {viewData.class_code}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Instansi">
                  {viewData.school_name}
                </Descriptions.Item>
                <Descriptions.Item label="Pembuat (Guru)">
                  {viewData.teacher_name || viewData.teacher_id}
                </Descriptions.Item>
              </Descriptions>
              
              <Title level={5}>Daftar Siswa ({classStudents.length})</Title>
              <Table 
                dataSource={classStudents}
                loading={studentsLoading}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                columns={[
                  { title: "No.", render: (_, __, i) => i + 1, width: 50 },
                  { title: "Nama Siswa", dataIndex: "name", key: "name" },
                  { title: "Email", dataIndex: "email", key: "email" },
                ]}
                size="small"
              />
            </div>
          ) : (
            <p>Memuat data...</p>
          )
        ) : (
          <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
            <Form.Item 
              label="Nama Kelas" 
              name="class_name" 
              rules={[{ required: true, message: "Nama kelas wajib diisi!" }]}
            >
              <Input placeholder="Misal: 10 IPA 1" size="large" />
            </Form.Item>
            
            <Form.Item 
              label="Nama Sekolah/Instansi" 
              name="school_name" 
              rules={[{ required: true, message: "Nama instansi wajib diisi!" }]}
            >
              <Input placeholder="Misal: SMAN 1 Jakarta" size="large" />
            </Form.Item>

            <Form.Item label="Kode Kelas" required>
              <Space.Compact style={{ width: "100%" }}>
                <Form.Item 
                  name="class_code" 
                  noStyle 
                  rules={[{ required: true, message: "Kode kelas wajib diisi atau di-generate!" }]}
                >
                  <Input placeholder="Generate atau ketik manual" size="large" />
                </Form.Item>
                <Button 
                  size="large" 
                  icon={<ThunderboltOutlined />} 
                  style={{ color: "#7246BA", borderColor: "#7246BA" }} 
                  onClick={handleGenerateKode}
                >
                  Generate Kode
                </Button>
              </Space.Compact>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}

