import jsonpatch from 'fast-json-patch';
import { UseMutateFunction, useMutation, useQueryClient } from 'react-query';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

async function patchUserOnServer(
  newUser: User | null,
  oldUser: User | null,
): Promise<User | null> {
  if (!newUser || !oldUser) return null;
  const patch = jsonpatch.compare(oldUser, newUser);
  const { data } = await axiosInstance.patch<{ user: User }>(
    `/user/${oldUser.id}`,
    {
      patch,
    },
    {
      headers: getJWTHeader(oldUser),
    },
  );
  return data.user;
}

export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  { previousUserData: User }
> {
  const { user: oldUser, updateUser } = useUser();
  const toast = useCustomToast();
  const queryClient = useQueryClient();
  const { mutate: patchUser } = useMutation(
    (newUser: User | null) => patchUserOnServer(newUser, oldUser),
    {
      // onMutate returns context passed to onError
      onMutate: async (newUser: User | null) => {
        // you have to set the useQuery to be cancellable before you can update the exact same query key optimistically
        // the basic steps for optimistic updates
        // 1. cancel any outgoing queries for the user data,
        //   since we're about to update it and it doesn't overwrite the our optimistic data
        queryClient.cancelQueries(queryKeys.user);
        //  2, snapshot of the previous user data
        const previousUserData: User = queryClient.getQueryData(queryKeys.user);
        // 3. optimistic update the cache with the new user data
        updateUser(newUser);

        // 4. return the context with  previous user data
        return { previousUserData };
      },
      onError: (error, newData, context) => {
        // rollback the cache with the previous user data
        if (context.previousUserData) {
          updateUser(context.previousUserData);
          toast({
            title: 'Update failed; restoring previous values',
            status: 'warning',
          });
        }
      },
      onSuccess: (user) => {
        if (user) {
          toast({
            title: 'User updated successfully',
            status: 'success',
          });
        }
      },
      onSettled: () => {
        //  invalidate the user query after the mutation has settled to ensure the cache is up to date
        queryClient.invalidateQueries(queryKeys.user);
      },
    },
  );
  return patchUser;
}
