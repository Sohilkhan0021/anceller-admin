import { KeenIcon } from '@/components';
import { toAbsoluteUrl } from '@/utils/Assets';

interface IBasicSettingsProps {
  title: string;
}

const BasicSettings = ({ title }: IBasicSettingsProps) => {
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
                <a href="#" className="text-gray-800 font-normal text-sm hover:text-primary-active">
                  jasontt@studio.co
                </a>
              </td>
              <td className="py-2 max-w-16 text-end">
                <a href="#" className="btn btn-sm btn-icon btn-clear btn-primary">
                  <KeenIcon icon="notepad-edit" />
                </a>
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-600 font-normal">Password</td>
              <td className="py-2 text-gray-700 font-normal">Password last changed 2 months ago</td>
              <td className="py-2 text-end">
                <a href="#" className="btn btn-sm btn-icon btn-clear btn-primary">
                  <KeenIcon icon="notepad-edit" />
                </a>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
};

export { BasicSettings, type IBasicSettingsProps };
