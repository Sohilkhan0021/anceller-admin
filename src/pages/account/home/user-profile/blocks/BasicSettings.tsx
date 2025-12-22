import { useAdminProfile } from '@/services';
import { ContentLoader } from '@/components/loaders';

interface IBasicSettingsProps {
  title: string;
}

const BasicSettings = ({ title }: IBasicSettingsProps) => {
  const { profile, isLoading } = useAdminProfile();

  if (isLoading) {
    return (
      <div className="card min-w-full">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
        <div className="card-body">
          <ContentLoader />
        </div>
      </div>
    );
  }

  const email = profile?.email || 'No email';
  const emailVerified = profile?.is_email_verified ? 'Verified' : 'Not verified';
  const phoneVerified = profile?.is_phone_verified ? 'Verified' : 'Not verified';

  return (
    <div className="card min-w-full">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
      </div>
      <div className="card-table scrollable-x-auto pb-3">
        <table className="table align-middle text-sm text-gray-500">
          <tbody>
            <tr>
              <td className="py-2 min-w-36 text-gray-600 font-normal">Email</td>
              <td className="py-2 min-w-60">
                {email && email !== 'No email' ? (
                  <a href={`mailto:${email}`} className="text-gray-800 font-normal text-sm hover:text-primary-active">
                    {email}
                  </a>
                ) : (
                  <span className="text-gray-500 font-normal text-sm">No email</span>
                )}
              </td>
              <td className="py-2 max-w-16 text-end">
                <span className="text-xs text-gray-400 italic">Read-only</span>
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-600 font-normal">Email Status</td>
              <td className="py-2 text-gray-700 font-normal text-sm">
                <span className={`badge badge-sm ${profile?.is_email_verified ? 'badge-success' : 'badge-secondary'}`}>
                  {emailVerified}
                </span>
              </td>
              <td className="py-2 text-end">
                <span className="text-xs text-gray-400 italic">Read-only</span>
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-600 font-normal">Phone Status</td>
              <td className="py-2 text-gray-700 font-normal text-sm">
                <span className={`badge badge-sm ${profile?.is_phone_verified ? 'badge-success' : 'badge-secondary'}`}>
                  {phoneVerified}
                </span>
              </td>
              <td className="py-2 text-end">
                <span className="text-xs text-gray-400 italic">Read-only</span>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};

export { BasicSettings, type IBasicSettingsProps };
