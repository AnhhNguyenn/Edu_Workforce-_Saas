import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export interface SystemSettingDto {
  settingKey: string;
  settingValue: string;
  description: string;
  isPublic: boolean;
}

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const response = await apiClient.get<SystemSettingDto[]>('/systemsettings');
      return response.data;
    }
  });
};

export const useUpdateSystemSetting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { key: string, value: string }) => {
      await apiClient.put(`/systemsettings/${data.key}`, { settingValue: data.value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
    }
  });
};
