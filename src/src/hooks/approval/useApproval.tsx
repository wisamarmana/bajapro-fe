import { useState, useEffect } from "react";
import { App } from "antd";
import React from "react";
import { TeacherRecord } from "@/src/types/approval";
import { fetchPengajarApi, approvePengajarApi, rejectPengajarApi } from "@/src/actions/approval/approvalApi";

export const useApproval = () => {
  const { message } = App.useApp();
  const [data, setData] = useState<TeacherRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState("");
  
  // State baru untuk filter status ("all" untuk tampilkan semua)
  const [statusFilter, setStatusFilter] = useState<number | "all">("all"); 
  
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Fetch data awal
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetchPengajarApi();
        setData(response);
      } catch (error) {
        message.error("Gagal mengambil data pengajar");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [message]);

  // Handler Bulk Approve
  const handleBulkApprove = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      await approvePengajarApi(selectedRowKeys);
      setData((prev) =>
        prev.map((item) => (selectedRowKeys.includes(item.key) && item.is_approved_by_admin === 0 ? { ...item, is_approved_by_admin: 1 } : item))
      );
      message.success(`${selectedRowKeys.length} akun pengajar berhasil di-approve!`);
      setSelectedRowKeys([]); 
    } catch (error) {
      message.error("Gagal meng-approve data terpilih.");
    }
  };

  // Handler Bulk Reject
  const handleBulkReject = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      await rejectPengajarApi(selectedRowKeys);
      setData((prev) =>
        prev.map((item) => (selectedRowKeys.includes(item.key) && item.is_approved_by_admin === 0 ? { ...item, is_approved_by_admin: 2 } : item))
      );
      message.warning(`${selectedRowKeys.length} akun pengajar ditolak.`);
      setSelectedRowKeys([]); 
    } catch (error) {
      message.error("Gagal menolak data terpilih.");
    }
  };

  const handleRowApprove = async (id: React.Key) => {
    try {
      await approvePengajarApi([id]);
      setData((prev) =>
        prev.map((item) => (item.key === id ? { ...item, is_approved_by_admin: 1 } : item))
      );
      message.success(`Akun pengajar berhasil di-approve!`);
      setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
    } catch (error) {
      message.error("Gagal meng-approve data.");
    }
  };

  const handleRowReject = async (id: React.Key) => {
    try {
      await rejectPengajarApi([id]);
      setData((prev) =>
        prev.map((item) => (item.key === id ? { ...item, is_approved_by_admin: 2 } : item))
      );
      message.warning(`Akun pengajar ditolak.`);
      setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
    } catch (error) {
      message.error("Gagal menolak data.");
    }
  };

  // Config Checkbox Ant Design
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => setSelectedRowKeys(newSelectedRowKeys),
    getCheckboxProps: (record: TeacherRecord) => ({
      disabled: record.is_approved_by_admin !== 0, 
    }),
  };

  // Filter Search & Status digabung
  const filteredData = data.filter((item) => {
    // 1. Cek kecocokan teks (Search)
    const matchText =
      item.nama.toLowerCase().includes(searchText.toLowerCase()) ||
      item.email.toLowerCase().includes(searchText.toLowerCase()) ||
      item.instansi.toLowerCase().includes(searchText.toLowerCase());

    // 2. Cek kecocokan status (Filter Dropdown)
    const matchStatus = statusFilter === "all" || item.is_approved_by_admin === statusFilter;

    // Harus cocok keduanya
    return matchText && matchStatus;
  });

  return {
    loading,
    searchText,
    setSearchText,
    statusFilter,      // Export state
    setStatusFilter,   // Export setter
    selectedRowKeys,
    filteredData,
    rowSelection,
    handleBulkApprove,
    handleBulkReject,
    handleRowApprove,
    handleRowReject
  };
};
