import React, { createContext, useContext, ReactNode } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
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
            enqueueSnackbar(data.message || 'User created successfully', { variant: 'success' });
            // Invalidate users query to refetch the list so the new user appears
            queryClient.invalidateQueries(['users']);
        },
        onError: (error: Error) => {
            enqueueSnackbar(error.message || 'Failed to create user', { variant: 'error' });
        }
    });

    const createUser = async (formData: any) => {
        // Map form data (camelCase) to API payload (snake_case)
        const payload: ICreateUserRequest = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone_number: formData.phone,
            address: formData.address || '',
            city: formData.city || '',
            state: formData.state || '',
            pincode: formData.pincode || '',
            status: formData.status ? formData.status.toUpperCase() : 'ACTIVE', // Ensure generic status if needed, or keeping as is depending on API
            is_verified: formData.isVerified,
            notes: formData.notes || ''
        };

        // Note: The status in API might be strictly enum. 
        // The form sends 'active', 'inactive', 'blocked'. 
        // The previous analysis of user.types.ts shows UserStatus = 'active' | 'blocked' | 'inactive'.
        // However, the screenshot reaction shows "status": "ACTIVE". 
        // So I might need to uppercase it. I'll uppercase it to be safe or rely on backend to handle case.
        // Given the response body in screenshot has "ACTIVE", I'll send it as is or uppercase if I see fit.
        // The form default is 'active'.
        // Let's modify the payload generation slightly to be safe.

        // Actually, looking at the type definition I added: status?: string;
        // So I will just pass it. The screenshot has "ACTIVE".

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
