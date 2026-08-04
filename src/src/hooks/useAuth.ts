import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

interface Role {
  id: number;
  name: string;
  isactive?: boolean;
}

interface Permission {
  id?: number;
  name: string;
  role_ids?: Array<number | string>;
}

export const useAuth = () => {
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [permissions, setPermissions] =
    useState<Permission[]>([]);

  const [loading, setLoading] = useState(true);
  const [permLoading, setPermLoading] =
    useState(true);

  const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL;

  const getAuthHeaders = useCallback(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const token =
      localStorage.getItem("token") || "";

    return token
      ? {
        Authorization: `Bearer ${token}`,
      }
      : {};
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);

      if (!BASE_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL belum dikonfigurasi"
        );
      }

      const res = await fetch(
        `${BASE_URL}/auth/profile?t=${Date.now()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      const result = await res
        .json()
        .catch(() => null);

      if (!res.ok) {
        console.error(
          "Gagal mengambil profile:",
          res.status,
          result
        );

        setUser(null);
        return;
      }

      setUser(
        result?.success && result?.data
          ? result.data
          : null
      );
    } catch (error) {
      console.error(
        "Fetch profile error:",
        error
      );

      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, getAuthHeaders]);

  const fetchPermissions =
    useCallback(async () => {
      try {
        setPermLoading(true);

        if (!BASE_URL) {
          throw new Error(
            "NEXT_PUBLIC_API_URL belum dikonfigurasi"
          );
        }

        const res = await fetch(
          `${BASE_URL}/permissions`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: {
              Accept: "application/json",
              ...getAuthHeaders(),
            },
          }
        );

        const result = await res
          .json()
          .catch(() => null);

        if (!res.ok) {
          throw new Error(
            result?.message ||
            `Permission request gagal: ${res.status}`
          );
        }

        setPermissions(
          Array.isArray(result?.data)
            ? result.data
            : []
        );
      } catch (error) {
        console.error(
          "Fetch permissions error:",
          error
        );

        setPermissions([]);
      } finally {
        setPermLoading(false);
      }
    }, [BASE_URL, getAuthHeaders]);

  useEffect(() => {
    void fetchUser();
    void fetchPermissions();
  }, [
    pathname,
    fetchUser,
    fetchPermissions,
  ]);

  useEffect(() => {
    const handler = () => {
      void fetchPermissions();
    };

    window.addEventListener(
      "permission-updated",
      handler
    );

    return () => {
      window.removeEventListener(
        "permission-updated",
        handler
      );
    };
  }, [fetchPermissions]);

  const can = (
    permissionName: string
  ): boolean => {
    if (!user) return false;

    const normalizedPermission =
      permissionName.toLowerCase();

    /*
     * Pilihan pertama:
     * permission sudah berada di dalam role user.
     */
    const roles: Role[] = Array.isArray(
      user.has_roles
    )
      ? user.has_roles
      : [];

    const permissionFromRole = roles.some(
      (role: any) =>
        role.isactive !== false &&
        Array.isArray(
          role.has_permission
        ) &&
        role.has_permission.some(
          (permission: any) =>
            String(
              permission?.name || ""
            ).toLowerCase() ===
            normalizedPermission
        )
    );

    if (permissionFromRole) {
      return true;
    }

    /*
     * Fallback untuk endpoint permission lama
     * yang masih mengirim role_ids.
     */
    const activeRoleIds = roles
      .filter(
        (role) =>
          role.isactive !== false
      )
      .map((role) => Number(role.id));

    const permission = permissions.find(
      (item) =>
        String(item.name).toLowerCase() ===
        normalizedPermission
    );

    if (
      !permission ||
      !Array.isArray(permission.role_ids)
    ) {
      return false;
    }

    return permission.role_ids
      .map(Number)
      .some((roleId) =>
        activeRoleIds.includes(roleId)
      );
  };

  return {
    user,
    can,

    // Loading profile saja
    loading,

    // Loading permission dipisahkan
    permLoading,

    refetchUser: fetchUser,
    refetchPermissions:
      fetchPermissions,
  };
};