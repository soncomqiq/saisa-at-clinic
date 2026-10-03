import { useCallback, useEffect, useState } from 'react';
import type { ClinicData } from '../domain/types';
import { getService } from './index';
import { errorMessage } from '../lib/format';
export function useClinic() {
  const [data,setData]=useState<ClinicData|null>(null);const [error,setError]=useState('');const [loading,setLoading]=useState(true);
  const refresh=useCallback(async()=>{try{setError('');setData(await getService().snapshot());}catch(error){setError(errorMessage(error));}finally{setLoading(false);}},[]);
  useEffect(()=>{void refresh();},[refresh]);
  return {data,error,loading,refresh};
}