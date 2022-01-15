import { Treatment } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';

export async function getTreatments(): Promise<Treatment[]> {
  const { data } = await axiosInstance.get('/treatments');
  return data;
}
