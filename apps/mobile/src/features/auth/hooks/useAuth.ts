import { useMutation } from '@tanstack/react-query';
import type { LoginRequestDto, RegisterRequestDto } from '@fleetflow/shared-types';

import { queryClient } from '@/src/services/queryClient';
import { useAppDispatch } from '@/src/store/hooks';
import { signedIn, signedOut } from '@/src/store/slices/authSlice';

import { getAuthErrorMessage, login, logout, register } from '../api';

export function useLogin() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: LoginRequestDto) => login(payload),
    onSuccess: (user) => {
      dispatch(signedIn(user));
      queryClient.setQueryData(['me'], user);
    },
  });
}

export function useRegister() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: RegisterRequestDto) => register(payload),
    onSuccess: (user) => {
      dispatch(signedIn(user));
      queryClient.setQueryData(['me'], user);
    },
  });
}

export function useLogout() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      dispatch(signedOut());
      queryClient.clear();
    },
  });
}

export { getAuthErrorMessage };
