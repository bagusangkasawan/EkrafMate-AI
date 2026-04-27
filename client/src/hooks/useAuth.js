import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { userInfo, loading, error } = useSelector((state) => state.auth);
  return { userInfo, loading, error };
};
