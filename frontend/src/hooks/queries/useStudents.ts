import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export const useStudents = (keyword?: string, pageNumber: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: ['students', keyword, pageNumber, pageSize],
    queryFn: async () => {
      const response = await apiClient.get('/students', {
        params: { searchKeyword: keyword, pageNumber, pageSize }
      });
      return response.data;
    }
  });
};

export const useStudent = (id: string | null) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async () => {
      const response = await apiClient.get(`/students/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

export const useExportStudents = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.get('/students/export', {
        responseType: 'blob'
      });
      return response.data;
    }
  });
};

export const useImportStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/students/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    }
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/students', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    }
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put(`/students/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student'] });
    }
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/students/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    }
  });
};

export const useBulkAssignClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { studentIds: string[], classId: string }) => {
      const response = await apiClient.post('/students/bulk-assign-class', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    }
  });
};
