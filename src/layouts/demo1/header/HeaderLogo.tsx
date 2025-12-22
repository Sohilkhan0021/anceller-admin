import { Link } from 'react-router-dom';
import { KeenIcon } from '@/components/keenicons';
import { toAbsoluteUrl } from '@/utils';

import { useDemo1Layout } from '../';

const HeaderLogo = () => {
  const { setMobileSidebarOpen, setMobileMegaMenuOpen, megaMenuEnabled } = useDemo1Layout();

  const handleSidebarOpen = () => {
    setMobileSidebarOpen(true);
  };

  const handleMegaMenuOpen = () => {
    setMobileMegaMenuOpen(true);
  };

  return (
    <div className="flex gap-1 items-center">
      {/* Desktop Logo */}
      <Link to="/" className="hidden lg:flex shrink-0 items-center relative z-10">
        <img
          src={toAbsoluteUrl('/media/app/mini-logo-white.svg')}
          className="max-h-[30px] w-auto h-[30px] object-contain block"
          alt="mini-logo-white"
          style={{ minWidth: '40px' }}
        />
      </Link>

      {/* Mobile Logo */}
      <Link to="/" className="lg:hidden shrink-0 flex items-center relative z-10">
        <img
          src={toAbsoluteUrl('/media/app/mini-logo-white.svg')}
          className="max-h-[25px] w-auto h-[25px] object-contain block"
          alt="mini-logo-white"
          style={{ minWidth: '32px' }}
        />
      </Link>

      {/* Mobile Menu Buttons */}
      <div className="flex items-center lg:hidden ml-auto">
        <button
          type="button"
          className="btn btn-icon btn-light btn-clear btn-sm"
          onClick={handleSidebarOpen}
        >
          <KeenIcon icon="ki-filled ki-menu" className="text-white" />
        </button>

        {megaMenuEnabled && (
          <button
            type="button"
            className="btn btn-icon btn-light btn-clear btn-sm"
            onClick={handleMegaMenuOpen}
          >
            <KeenIcon icon="burger-menu-2" className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

export { HeaderLogo };
