import { AxiosResponse } from "axios";
import axiosInstance from "./axios";
import { AppDispatch } from "../store";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  next?: number;
  prev?: number;
  total?: number;
};

type CrudService<TGet, TPost, TUpdate> = {
  local: {
    getAll: (params?: any) => Promise<AxiosResponse<ApiResponse<TGet[]>>>;
    getById: (
      id: string | number,
      params?: any
    ) => Promise<AxiosResponse<ApiResponse<TGet>>>;
    post: (
      data: TPost,
      params?: any
    ) => Promise<AxiosResponse<ApiResponse<TGet>>>;
    update: (
      id: string | number,
      data: TUpdate
    ) => Promise<AxiosResponse<ApiResponse<TGet>>>;
    remove: (
      id: string | number,
      isPermanent?: boolean
    ) => Promise<AxiosResponse<ApiResponse<void>>>;
  };
  global: {
    getAll: (params?: any) => (dispatch: AppDispatch) => Promise<TGet[]>;
    post: (
      data: TPost
    ) => (dispatch: AppDispatch) => Promise<AxiosResponse<ApiResponse<TGet>>>;
    update: (
      id: string | number,
      data: TUpdate
    ) => (dispatch: AppDispatch) => Promise<AxiosResponse<ApiResponse<TGet>>>;
    remove: (
      id: string | number,
      isPermanent?: boolean
    ) => (dispatch: AppDispatch) => Promise<AxiosResponse<ApiResponse<void>>>;
  };
};

type CrudSliceActions<TGet> = {
  setData: (data: TGet | TGet[]) => any;
  setLoading: (loading: boolean) => any;
  setError: (error: string) => any;
};

type CrudFactoryParams<TGet, TPost, TUpdate> = {
  basePath: string;
  entity: TGet;
  postDto: TPost;
  updateDto: TUpdate;
  actions?: CrudSliceActions<TGet>;
};

export function createCrudService<TGet, TPost, TUpdate>(
  params: CrudFactoryParams<TGet, TPost, TUpdate>
): CrudService<TGet, TPost, TUpdate> {
  const { basePath, actions } = params;

  // ========== LOCAL (tanpa Redux dispatch) ==========
  const local = {
    getAll: (params?: any) =>
      axiosInstance.get<ApiResponse<TGet[]>>(basePath, { params }),

    getById: (id: string | number, params?: any) =>
      axiosInstance.get<ApiResponse<TGet>>(`${basePath}/${id}`, { params }),

    post: (data: TPost, params?: any) =>
      axiosInstance.post<ApiResponse<TGet>>(basePath, data, { params }),

    update: (id: string | number, data: TUpdate) =>
      axiosInstance.put<ApiResponse<TGet>>(`${basePath}/${id}`, data),

    remove: (id: string | number, isPermanent?: boolean) =>
      axiosInstance.delete<ApiResponse<void>>(`${basePath}/${id}`, {
        params: isPermanent ? { isPermanent } : false,
      }),
  };

  // ========== GLOBAL (pakai Redux dispatch) ==========
  const global = {
    getAll:
      (params?: any) =>
      async (dispatch: AppDispatch): Promise<TGet[]> => {
        if (!actions) return [];

        dispatch(actions.setLoading(true));
        try {
          const res = await local.getAll(params);
          const data = res.data.data;

          const result = actions.setData(data);
          dispatch(result);

          return data;
        } catch (err: any) {
          const message = err?.response?.data?.error || err.message;
          dispatch(actions.setError(message));
          return [];
        } finally {
          dispatch(actions.setLoading(false));
        }
      },

    post:
      (data: TPost) =>
      async (
        dispatch: AppDispatch
      ): Promise<AxiosResponse<ApiResponse<TGet>>> => {
        if (!actions) return Promise.reject("No actions provided");

        try {
          const res = await local.post(data);
          const result = actions.setData(res.data.data);
          dispatch(result);

          return res;
        } catch (err: any) {
          const message = err?.response?.data?.error || err.message;
          dispatch(actions.setError(message));
          throw err;
        }
      },

    update:
      (id: string | number, data: TUpdate) =>
      async (
        dispatch: AppDispatch
      ): Promise<AxiosResponse<ApiResponse<TGet>>> => {
        if (!actions) return Promise.reject("No actions provided");

        try {
          const res = await local.update(id, data);
          const result = actions.setData(res.data.data);
          dispatch(result);

          return res;
        } catch (err: any) {
          const message = err?.response?.data?.error || err.message;
          dispatch(actions.setError(message));
          throw err;
        }
      },

    remove:
      (id: string | number, isPermanent?: boolean) =>
      async (
        dispatch: AppDispatch
      ): Promise<AxiosResponse<ApiResponse<void>>> => {
        if (!actions) return Promise.reject("No actions provided");

        try {
          const res = await local.remove(id, isPermanent);
          await dispatch(global.getAll());
          return res;
        } catch (err: any) {
          const message = err?.response?.data?.error || err.message;
          dispatch(actions.setError(message));
          throw err;
        }
      },
  };

  return { local, global };
}