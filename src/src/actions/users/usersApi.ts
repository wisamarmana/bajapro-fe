import { UserData, UserFormData } from "@/src/types/users";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") return "/api";
  if (process.env.VERCEL_URL) return "https://" + process.env.VERCEL_URL + "/api";
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}/api`;
};
const BASE_URL = getBaseUrl();
const USE_REAL_API = true;

const handleFetch = async (url: string, options?: RequestInit) => {
  if (USE_REAL_API) {
    try {
      let token = "";
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token") || ""; 
      }

      const customOptions: RequestInit = {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options?.headers || {}), 
        },
      };

      const response = await fetch(url, customOptions);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn("Akses ditolak atau sesi kedaluwarsa. Redirecting ke login...");
        }
        let errorMsg = response.statusText;
        try {
          const errorJson = await response.json();
          errorMsg = errorJson.error || errorMsg;
        } catch (e) {}
        console.error(`Fetch Error: ${response.status} - ${errorMsg} pada URL: ${url}`);
        throw new Error(`Server Error (${response.status}): ${errorMsg}`);
      }
      
      return response.json();
    } catch (err) {
      console.error("Network Error:", err);
      throw err;
    }
  } else {
    return new Promise((resolve) => setTimeout(() => resolve(null), 300));
  }
};

// --- DATA DUMMY ---
let dummyUsers: UserData[] = [
  { id: 1, name: "Yolanda Ekaputri S", role: "Admin", email: "yolanda@gmail.com", isactive: 1 },
  { id: 2, name: "Fida Cahya", role: "Pengajar", email: "fida@gmail.com", isactive: 1, instansi_sekolah: "Polinema" },
  { id: 3, name: "Yovi Dwicho", role: "Pelajar", email: "yovi@gmail.com", isactive: 1, class_name: "12 IPA 1" },
  { id: 4, name: "Budi Santoso", role: "Pelajar", email: "budi@gmail.com", isactive: 0, class_name: "12 IPA 2" },
];

export const getUsersApi = async (teacherId?: number | null): Promise<UserData[]> => {
  if (USE_REAL_API) {
    const url = teacherId ? `${BASE_URL}/users?teacher_id=${teacherId}` : `${BASE_URL}/users`;
    const users = await handleFetch(url);
    const roles = await handleFetch(`${BASE_URL}/roles`);
    const classes = await handleFetch(`${BASE_URL}/class`);
    return users.map((u: any) => {
      const role = roles.find((r: any) => Number(r.id) === Number(u.role_id));
      const userClass = classes.find((c: any) => Number(c.id) === Number(u.class_id));
      return {
        ...u,
        role: role ? role.role_name : (u.role || "Belum diatur"),
        class_name: userClass ? userClass.class_name : (u.class_name || "Tidak ada kelas")
      };
    });
  } else {
    return new Promise((resolve) => setTimeout(() => resolve([...dummyUsers]), 300));
  }
};

export const getUserByIdApi = async (id: string | number): Promise<UserData> => {
  if (USE_REAL_API) {
    return handleFetch(`${BASE_URL}/users/${id}`);
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = dummyUsers.find((item) => item.id == id);
        resolve(found as UserData);
      }, 300);
    });
  }
};

export const createUserApi = async (data: UserFormData): Promise<void> => {
  if (USE_REAL_API) {
    await handleFetch(`${BASE_URL}/users`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextId = dummyUsers.length > 0 
          ? Math.max(...dummyUsers.map(user => Number(user.id))) + 1 
          : 1;

        const newUser: UserData = {
          id: nextId,
          name: data.name,
          role: data.role,
          email: data.email,
          isactive: 1, 
          instansi_sekolah: data.instansi_sekolah,
          class_name: data.class_name,
        };
        dummyUsers.push(newUser);
        resolve();
      }, 500);
    });
  }
};

export const updateUserApi = async (id: string|number, data: UserFormData): Promise<void> => {
  if (USE_REAL_API) {
    await handleFetch(`${BASE_URL}/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyUsers = dummyUsers.map((item) =>
          item.id == id
            ? { ...item, name: data.name, role: data.role, email: data.email, instansi_sekolah: data.instansi_sekolah, class_name: data.class_name }
            : item
        );
        resolve();
      }, 500);
    });
  }
};

export const deleteUserApi = async (id: string | number): Promise<void> => {
  if (USE_REAL_API) {
    await handleFetch(`${BASE_URL}/users/${id}`, { method: "DELETE" });
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyUsers = dummyUsers.filter((item) => item.id != id);
        resolve();
      }, 500);
    });
  }
};


export const getInstansiOptionsApi = async (): Promise<{ label: string; value: string }[]> => {
  if (USE_REAL_API) {
    try {
      const users = await handleFetch(`${BASE_URL}/users`);
      const instansi = Array.from(new Set(users.map((u: any) => u.instansi_sekolah).filter(Boolean)));
      return instansi.map((i) => ({ label: i as string, value: i as string }));
    } catch (error) {
      return [
        { label: "Polinema", value: "Polinema" },
        { label: "SMAN 1 Malang", value: "SMAN 1 Malang" },
        { label: "Universitas Brawijaya", value: "Universitas Brawijaya" },
      ];
    }
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: "Polinema", value: "Polinema" },
          { label: "SMAN 1 Malang", value: "SMAN 1 Malang" },
          { label: "Universitas Brawijaya", value: "Universitas Brawijaya" },
        ]);
      }, 300);
    });
  }
};

export const getKelasOptionsApi = async (teacherId?: number | null): Promise<{ label: string; value: string }[]> => {
  if (USE_REAL_API) {
    try {
      const url = teacherId
        ? `${BASE_URL}/class?teacher_id=${teacherId}`
        : `${BASE_URL}/class`;
      const classes = await handleFetch(url);
      return classes.map((c: any) => ({ label: c.class_name, value: c.class_name }));
    } catch (error) {
      return [
        { label: "10 IPA 1", value: "10 IPA 1" },
        { label: "11 IPS 2", value: "11 IPS 2" },
        { label: "12 Bahasa", value: "12 Bahasa" },
      ];
    }
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: "10 IPA 1", value: "10 IPA 1" },
          { label: "11 IPS 2", value: "11 IPS 2" },
          { label: "12 Bahasa", value: "12 Bahasa" },
        ]);
      }, 300);
    });
  }
};

export const getRoleOptionsApi = async (): Promise<{ label: string; value: string }[]> => {
  if (USE_REAL_API) {
    try {
      const roles = await handleFetch(`${BASE_URL}/roles`);
      return roles.map((r: any) => ({ label: r.role_name, value: r.role_name }));
    } catch (error) {
      return [
        { label: "Admin", value: "Admin" },
        { label: "Pengajar", value: "Pengajar" },
        { label: "Pelajar", value: "Pelajar" },
      ];
    }
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { label: "Admin", value: "Admin" },
          { label: "Pengajar", value: "Pengajar" },
          { label: "Pelajar", value: "Pelajar" },
        ]);
      }, 300);
    });
  }
};
