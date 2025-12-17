import React, { createContext, useContext, ReactNode } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';
import { ICreateUserRequest } from '@/services/user.types';

interface IUserManageContext {
    createUser: (userData: any) => Promise<void>;
    isLoading: boolean;
    currentUserDetails: import('@/services/user.types').IUserDetails | null;
    fetchUserDetails: (userId: string) => Promise<void>;
    userDetailsLoading: boolean;
}

const UserManageContext = createContext<IUserManageContext | undefined>(undefined);

export const UserManageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { enqueueSnackbar } = useSnackbar();
    const queryClient = useQueryClient();
    const [currentUserDetails, setCurrentUserDetails] = React.useState<import('@/services/user.types').IUserDetails | null>(null);
    const [userDetailsLoading, setUserDetailsLoading] = React.useState(false);

    const mutation = useMutation(userService.createUser, {
        onSuccess: (data) => {
            toast.success(data.message || 'User created successfully');
            // Invalidate users query to refetch the list so the new user appears
            queryClient.invalidateQueries(['users']);
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create user');
        }
    });

    const createUser = async (formData: any) => {
        // Construct payload with only required fields first
        const payload: ICreateUserRequest = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone_number: formData.phone,
        };

        // Conditionally add optional fields only if they are not empty
        // This matches the Postman example where only required fields were sent
        if (formData.address) payload.address = formData.address;
        if (formData.city) payload.city = formData.city;
        if (formData.state) payload.state = formData.state;
        if (formData.pincode) payload.pincode = formData.pincode;
        if (formData.notes) payload.notes = formData.notes;

        // Handle status and verification
        if (formData.status) {
            payload.status = formData.status.toUpperCase();
        }

        if (typeof formData.isVerified === 'boolean') {
            payload.is_verified = formData.isVerified;
        }

        console.log('Creating user with payload:', payload);
        await mutation.mutateAsync(payload);
    };

    const fetchUserDetails = async (userId: string) => {
        setUserDetailsLoading(true);
        try {
            const response = await userService.getUserDetails(userId);
            setCurrentUserDetails(response.data.user);
        } catch (error: any) {
            console.error(error);
            enqueueSnackbar(error.message || 'Failed to fetch user details', { variant: 'error' });
            setCurrentUserDetails(null);
        } finally {
            setUserDetailsLoading(false);
        }
    };

    return (
        <UserManageContext.Provider value={{
            createUser,
            isLoading: mutation.isLoading,
            currentUserDetails,
            fetchUserDetails,
            userDetailsLoading
        }}>
            {children}
        </UserManageContext.Provider>
    );
};

export const useUserManage = () => {
    const context = useContext(UserManageContext);
    if (!context) {
        throw new Error('useUserManage must be used within a UserManageProvider');
    }
    return context;
};
