import { Dispatch, SetStateAction, useState } from 'react';
import { useQuery } from 'react-query';

import type { Staff } from '../../../../../shared/types';
import { axiosInstance } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { TreatmentNames } from '../../treatments/types';
import { filterByTreatment } from '../utils';

// for when we need a query function for useQuery
async function getStaff(): Promise<Staff[]> {
  const { data } = await axiosInstance.get('/staff');
  return data;
}

interface UseStaff {
  staff: Staff[];
  filter: string;
  setFilter: Dispatch<SetStateAction<TreatmentNames>>;
}

export function useStaff(): UseStaff {
  // for filtering staff by treatment
  const [filter, setFilter] = useState<TreatmentNames>('all');
  console.log('filter: ', filter);

  // TODO: get data from server via useQuery
  const fallback = [];
  const { data = fallback } = useQuery(queryKeys.staff, getStaff);
  const staff = filterByTreatment(data, filter);

  return { staff, filter, setFilter };
}
