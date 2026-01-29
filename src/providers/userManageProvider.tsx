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
    updateUserStatus: (userId: string, status: 'ACTIVE' | 'SUSPENDED') => Promise<void>;
    isUpdatingStatus: boolean;
    updateUser: (userId: string, userData: any) => Promise<void>;
    isUpdatingUser: boolean;
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
        onError: (error: any) => {
            // Extract detailed validation errors
            let errorMessage = error.message || 'Failed to create user';

            if (error.errors) {
                const errorMessages: string[] = [];
                if (Array.isArray(error.errors)) {
                    error.errors.forEach((err: any) => {
                        if (err.message) errorMessages.push(err.message);
                    });
                } else if (typeof error.errors === 'object') {
                    // Format validation errors into a readable message
                    Object.keys(error.errors).forEach((field) => {
                        const fieldErrors = error.errors[field];
                        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                            errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
                        } else if (typeof fieldErrors === 'string') {
                            errorMessages.push(`${field}: ${fieldErrors}`);
                        }
                    });
                }

                if (errorMessages.length > 0) {
                    errorMessage = errorMessages.join('; ');
                }
            }

            toast.error(errorMessage);
            // Re-throw with errors object for form handling
            const enhancedError: any = new Error(errorMessage);
            enhancedError.errors = error.errors;
            throw enhancedError;
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

    const fetchUserDetails = React.useCallback(async (userId: string) => {
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
    }, [enqueueSnackbar]);

    const statusMutation = useMutation(
        ({ userId, status }: { userId: string; status: 'ACTIVE' | 'SUSPENDED' }) =>
            userService.updateUserStatus(userId, status),
        {
            onSuccess: (_data, variables) => {
                const message = variables.status === 'SUSPENDED'
                    ? 'User blocked successfully'
                    : 'User unblock successfully';
                toast.success(message);
                queryClient.invalidateQueries(['users']);
                if (currentUserDetails) {
                    fetchUserDetails(currentUserDetails.user_id || currentUserDetails.id);
                }
            },
            onError: (error: Error) => {
                toast.error(error.message || 'Failed to update user status');
            }
        }
    );

    const updateUserStatus = async (userId: string, status: 'ACTIVE' | 'SUSPENDED') => {
        await statusMutation.mutateAsync({ userId, status });
    };

    const updateUserMutation = useMutation(
        ({ userId, userData }: { userId: string; userData: any }) =>
            userService.updateUser(userId, userData),
        {
            onSuccess: (data) => {
                toast.success(data.message || 'User updated successfully');
                queryClient.invalidateQueries(['users']);
                if (currentUserDetails) {
                    fetchUserDetails(currentUserDetails.user_id || currentUserDetails.id);
                }
            },
            onError: (error: any) => {
                // Extract detailed validation errors
                let errorMessage = error.message || 'Failed to update user';

                if (error.errors) {
                    const errorMessages: string[] = [];
                    if (Array.isArray(error.errors)) {
                        error.errors.forEach((err: any) => {
                            if (err.message) errorMessages.push(err.message);
                        });
                    } else if (typeof error.errors === 'object') {
                        // Format validation errors into a readable message
                        Object.keys(error.errors).forEach((field) => {
                            const fieldErrors = error.errors[field];
                            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                                errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
                            } else if (typeof fieldErrors === 'string') {
                                errorMessages.push(`${field}: ${fieldErrors}`);
                            }
                        });
                    }

                    if (errorMessages.length > 0) {
                        errorMessage = errorMessages.join('; ');
                    }
                }

                toast.error(errorMessage);
                // Re-throw with errors object for form handling
                const enhancedError: any = new Error(errorMessage);
                enhancedError.errors = error.errors;
                throw enhancedError;
            }
        }
    );

    const updateUser = async (userId: string, userData: any) => {
        await updateUserMutation.mutateAsync({ userId, userData });
    };

    return (
        <UserManageContext.Provider value={{
            createUser,
            isLoading: mutation.isLoading,
            currentUserDetails,
            fetchUserDetails,
            userDetailsLoading,
            updateUserStatus,
            isUpdatingStatus: statusMutation.isLoading,
            updateUser,
            isUpdatingUser: updateUserMutation.isLoading
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
