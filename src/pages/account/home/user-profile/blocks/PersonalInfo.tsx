import { useState, useEffect } from 'react';
import { useAdminProfile, useUpdateAdminProfile } from '@/services';
import { ContentLoader } from '@/components/loaders';
import { toAbsoluteUrl } from '@/utils';
import { ImageInput } from '@/components/image-input';
import { KeenIcon } from '@/components';
import { toast } from 'sonner';
import { API_URL } from '@/config/api.config';
import type { IImageInputFile } from '@/components/image-input';

const PersonalInfo = () => {
  const { profile, isLoading, refetch } = useAdminProfile();
  const updateProfile = useUpdateAdminProfile({
    onSuccess: () => {
      toast.success('Profile updated successfully');
      refetch();
      setIsEditingName(false);
      setIsEditingPhone(false);
      setHasChanges(false);
    },
    onError: (error: any) => {
      // Show validation errors if available
      if (error.validationErrors && error.validationErrors.length > 0) {
        const errorMessages = error.validationErrors.map((err: any) => 
          `${err.field || 'Field'}: ${err.message}`
        ).join('\n');
        toast.error(errorMessages, { duration: 5000 });
      } else {
        const errorMsg = error.message || 'Failed to update profile';
        // Check if it's a validation error from backend
        if (error.response?.data?.errors) {
          const validationErrors = error.response.data.errors;
          const errorMessages = Array.isArray(validationErrors)
            ? validationErrors.map((err: any) => `${err.field || 'Field'}: ${err.message}`).join('\n')
            : Object.entries(validationErrors).map(([field, messages]: [string, any]) => 
                `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
              ).join('\n');
          toast.error(errorMessages, { duration: 5000 });
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(errorMsg);
        }
      }
    },
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [phoneValue, setPhoneValue] = useState('');
  const [avatar, setAvatar] = useState<IImageInputFile[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  // Initialize form values from profile
  useEffect(() => {
    if (profile) {
      // Only update if values actually changed to prevent infinite loops
      const newName = profile.name || '';
      const newPhone = profile.phone || '';
      const newAvatarUrl = profile.profile_picture_url || toAbsoluteUrl('/media/avatars/300-2.png');
      
      if (nameValue !== newName) {
        setNameValue(newName);
      }
      if (phoneValue !== newPhone) {
        setPhoneValue(newPhone);
      }
      if (avatar.length === 0 || avatar[0]?.dataURL !== newAvatarUrl) {
        setAvatar([{ dataURL: newAvatarUrl }]);
      }
      setHasChanges(false);
      setPendingImageFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.user_id, profile?.name, profile?.phone, profile?.profile_picture_url]);

  const handleNameChange = (value: string) => {
    setNameValue(value);
    setHasChanges(true);
  };

  const handlePhoneChange = (value: string) => {
    setPhoneValue(value);
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    if (!profile) return;
    
    const updateData: any = {};
    
    // Handle name
    if (isEditingName || nameValue !== profile.name) {
      const nameParts = nameValue.trim().split(' ');
      updateData.first_name = nameParts[0] || '';
      updateData.last_name = nameParts.slice(1).join(' ') || '';
    }
    
    // Handle phone
    if (isEditingPhone || phoneValue !== profile.phone) {
      const phoneParts = phoneValue.trim().split(' ');
      let phone_country_code = phoneParts[0] || '';
      let phone_number = phoneParts.slice(1).join(' ') || phoneValue.trim();

      // If no country code, try to extract from existing phone
      if (!phone_country_code && profile.phone) {
        const existingParts = profile.phone.split(' ');
        phone_country_code = existingParts[0] || '';
        phone_number = existingParts.slice(1).join(' ') || phoneValue.trim();
      }
      
      updateData.phone_number = phone_number;
      updateData.phone_country_code = phone_country_code || undefined;
    }
    
    // Handle image upload
    if (pendingImageFile) {
      updateData.profile_picture = pendingImageFile;
    } else if (avatar.length === 0 && profile?.profile_picture_url) {
      // Avatar was removed
      updateData.profile_picture_url = null;
    }
    
    if (Object.keys(updateData).length > 0) {
      updateProfile.mutate(updateData);
    } else {
      toast.info('No changes to save');
      setHasChanges(false);
    }
  };

  const handleAvatarChange = (selectedAvatar: IImageInputFile[]) => {
    setAvatar(selectedAvatar);
    setHasChanges(true);
    
    if (selectedAvatar.length > 0 && selectedAvatar[0].dataURL) {
      // Check if it's a base64 data URL (new upload) or existing URL
      if (selectedAvatar[0].dataURL.startsWith('data:')) {
        // Convert data URL to File object
        const dataURL = selectedAvatar[0].dataURL;
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const file = new File([u8arr], `profile-${Date.now()}.${mime.split('/')[1]}`, { type: mime });
        setPendingImageFile(file);
      } else if (selectedAvatar[0].file) {
        // File object from ImageInput
        setPendingImageFile(selectedAvatar[0].file);
      } else {
        // Existing URL, no file to upload
        setPendingImageFile(null);
      }
    } else {
      // Remove avatar
      setPendingImageFile(null);
    }
  };

  if (isLoading) {
    return (
      <div className="card min-w-full">
        <div className="card-header">
          <h3 className="card-title">Personal Info</h3>
        </div>
        <div className="card-body">
          <ContentLoader />
        </div>
      </div>
    );
  }

  const displayName = profile?.name || 'N/A';
  const phone = profile?.phone || 'N/A';

  return (
    <div className="card min-w-full">
      <div className="card-header flex items-center justify-between">
        <h3 className="card-title">Personal Info</h3>
        {hasChanges && (
          <button
            onClick={handleSaveAll}
            disabled={updateProfile.isLoading}
            className="btn btn-sm btn-primary flex items-center gap-2"
          >
            {updateProfile.isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm" />
                Saving...
              </>
            ) : (
              <>
                <KeenIcon icon="check" />
                Save Changes
              </>
            )}
          </button>
        )}
      </div>
      <div className="card-table scrollable-x-auto pb-3">
        <table className="table align-middle text-sm text-gray-500">
          <tbody>
            <tr>
              <td className="py-2 min-w-28 text-gray-600 font-normal">Photo</td>
              <td className="py-2 text-gray700 font-normal min-w-32 text-2sm">
                150x150px JPEG, PNG Image
              </td>
              <td className="py-2 text-center">
                <div className="flex justify-center items-center">
                  <ImageInput value={avatar} onChange={handleAvatarChange}>
                    {({ onImageUpload }) => (
                      <div className="image-input size-16 cursor-pointer" onClick={onImageUpload}>
                        <div
                          className="btn btn-icon btn-icon-xs btn-light shadow-default absolute z-1 size-5 -top-0.5 -end-0.5 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAvatarChange([]);
                          }}
                        >
                          <KeenIcon icon="cross" />
                        </div>
                        <span className="tooltip" id="image_input_tooltip">
                          Click to upload or remove
                        </span>
                        <div
                          className="image-input-placeholder rounded-full border-2 border-success image-input-empty:border-gray-300"
                          style={{ backgroundImage: `url(${toAbsoluteUrl('/media/avatars/blank.png')})` }}
                        >
                          {avatar.length > 0 && <img src={avatar[0].dataURL} alt="avatar" className="rounded-full w-full h-full object-cover" />}
                          <div className="flex items-center justify-center cursor-pointer h-5 left-0 right-0 bottom-0 bg-dark-clarity absolute">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="12"
                              viewBox="0 0 14 12"
                              className="fill-light opacity-80"
                            >
                              <path
                                d="M11.6665 2.64585H11.2232C11.0873 2.64749 10.9538 2.61053 10.8382 2.53928C10.7225 2.46803 10.6295 2.36541 10.5698 2.24335L10.0448 1.19918C9.91266 0.931853 9.70808 0.707007 9.45438 0.550249C9.20068 0.393491 8.90806 0.311121 8.60984 0.312517H5.38984C5.09162 0.311121 4.799 0.393491 4.5453 0.550249C4.2916 0.707007 4.08701 0.931853 3.95484 1.19918L3.42984 2.24335C3.37021 2.36541 3.27716 2.46803 3.1615 2.53928C3.04584 2.61053 2.91234 2.64749 2.7765 2.64585H2.33317C1.90772 2.64585 1.49969 2.81486 1.19885 3.1157C0.898014 3.41654 0.729004 3.82457 0.729004 4.25002V10.0834C0.729004 10.5088 0.898014 10.9168 1.19885 11.2177C1.49969 11.5185 1.90772 11.6875 2.33317 11.6875H11.6665C12.092 11.6875 12.5 11.5185 12.8008 11.2177C13.1017 10.9168 13.2707 10.5088 13.2707 10.0834V4.25002C13.2707 3.82457 13.1017 3.41654 12.8008 3.1157C12.5 2.81486 12.092 2.64585 11.6665 2.64585ZM6.99984 9.64585C6.39413 9.64585 5.80203 9.46624 5.2984 9.12973C4.79478 8.79321 4.40225 8.31492 4.17046 7.75532C3.93866 7.19572 3.87802 6.57995 3.99618 5.98589C4.11435 5.39182 4.40602 4.84613 4.83432 4.41784C5.26262 3.98954 5.80831 3.69786 6.40237 3.5797C6.99644 3.46153 7.61221 3.52218 8.1718 3.75397C8.7314 3.98576 9.2097 4.37829 9.54621 4.88192C9.88272 5.38554 10.0623 5.97765 10.0623 6.58335C10.0608 7.3951 9.73765 8.17317 9.16365 8.74716C8.58965 9.32116 7.81159 9.64431 6.99984 9.64585Z"
                                fill=""
                              />
                              <path
                                d="M7 8.77087C8.20812 8.77087 9.1875 7.7915 9.1875 6.58337C9.1875 5.37525 8.20812 4.39587 7 4.39587C5.79188 4.39587 4.8125 5.37525 4.8125 6.58337C4.8125 7.7915 5.79188 8.77087 7 8.77087Z"
                                fill=""
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </ImageInput>
                </div>
              </td>
            </tr>
            <tr>
              <td className="py-2 text-gray-600 font-normal">Name</td>
              <td className="py-2 text-gray-800 font-normal text-sm">
                {isEditingName ? (
                  <input
                    type="text"
                    value={nameValue}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="input input-sm w-full"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsEditingName(false);
                        setNameValue(profile?.name || '');
                        setHasChanges(false);
                      }
                    }}
                  />
                ) : (
                  displayName
                )}
              </td>
              <td className="py-2 text-center">
                {isEditingName ? (
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setNameValue(profile?.name || '');
                      setHasChanges(false);
                    }}
                    className="btn btn-sm btn-icon btn-clear btn-secondary"
                  >
                    <KeenIcon icon="cross" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="btn btn-sm btn-icon btn-clear btn-primary"
                  >
                    <KeenIcon icon="notepad-edit" />
                  </button>
                )}
              </td>
            </tr>
            <tr>
              <td className="py-3 text-gray-600 font-normal">Phone</td>
              <td className="py-3 text-gray-800 font-normal text-sm">
                {isEditingPhone ? (
                  <input
                    type="text"
                    value={phoneValue}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="input input-sm w-full"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsEditingPhone(false);
                        setPhoneValue(profile?.phone || '');
                        setHasChanges(false);
                      }
                    }}
                  />
                ) : (
                  phone
                )}
              </td>
              <td className="py-3 text-center">
                {isEditingPhone ? (
                  <button
                    onClick={() => {
                      setIsEditingPhone(false);
                      setPhoneValue(profile?.phone || '');
                      setHasChanges(false);
                    }}
                    className="btn btn-sm btn-icon btn-clear btn-secondary"
                  >
                    <KeenIcon icon="cross" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingPhone(true)}
                    className="btn btn-sm btn-icon btn-clear btn-primary"
                  >
                    <KeenIcon icon="notepad-edit" />
                  </button>
                )}
              </td>
            </tr>
            <tr>
              <td className="py-3 text-gray-600 font-normal">Role</td>
              <td className="py-3 text-gray-800 font-normal">
                <span className="badge badge-sm badge-outline badge-primary">
                  Admin
                </span>
              </td>
              <td className="py-3 text-center">
                <span className="text-xs text-gray-400 italic">Read-only</span>
              </td>
            </tr>
            <tr>
              <td className="py-3 text-gray-600 font-normal">Status</td>
              <td className="py-3 text-gray-800 font-normal">
                <span className={`badge badge-sm badge-outline ${profile?.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'}`}>
                  {profile?.status || 'N/A'}
                </span>
              </td>
              <td className="py-3 text-center">
                <span className="text-xs text-gray-400 italic">Read-only</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { PersonalInfo };
