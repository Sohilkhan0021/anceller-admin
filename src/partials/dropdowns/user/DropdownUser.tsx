import { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useAuthContext } from '@/auth';
import { useLanguage } from '@/i18n';
import { toAbsoluteUrl } from '@/utils';
import { KeenIcon } from '@/components';
import { useAdminProfile } from '@/services';
import {
  MenuItem,
  MenuLink,
  MenuSub,
  MenuTitle,
  MenuSeparator,
  MenuIcon
} from '@/components/menu';

interface IDropdownUserProps {
  menuItemRef: any;
}




const DropdownUser = ({ menuItemRef }: IDropdownUserProps) => {
  const { logout } = useAuthContext();
  const { isRTL } = useLanguage();
  const { profile } = useAdminProfile();



  useEffect(() => {
    const handleScroll = () => {
      if (menuItemRef.current && menuItemRef.current.isOpen()) {
        menuItemRef.current.hide();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [menuItemRef]);


  const buildHeader = () => {
    let displayName = profile?.name || 'Admin User';
    let displayEmail = profile?.email || 'No email';
    const profileImage = profile?.profile_picture_url || toAbsoluteUrl('/media/avatars/300-2.png');

    // Truncate name if > 15 chars
    if (displayName.length > 15) {
      displayName = displayName.substring(0, 15) + '...';
    }

    // Truncate email if > 17 chars
    if (displayEmail !== 'No email' && displayEmail.length > 17) {
      displayEmail = displayEmail.substring(0, 17) + '...';
    }

    return (
      <div className="flex items-center px-5 py-1.5 gap-2">
        <img
          className="size-9 rounded-full border-2 border-success"
          src={profileImage}
          alt={displayName}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = toAbsoluteUrl('/media/avatars/300-2.png');
          }}
        />
        <div className="flex flex-col gap-1.5">
          <Link
            to="/account/home/user-profile"
            className="text-sm text-gray-800 hover:text-primary font-semibold leading-none"
          >
            {displayName}
          </Link>
          {displayEmail && displayEmail !== 'No email' ? (
            // <a
            //   href={`mailto:${displayEmail}`}
            //   className="text-xs text-gray-600 hover:text-primary font-medium leading-none"
            // >
            //   {displayEmail}
            // </a>
            <span className="text-xs text-gray-600 font-medium leading-none cursor-default">
              {displayEmail}
            </span>

          ) : (
            <span className="text-xs text-gray-500 font-medium leading-none">
              No email
            </span>
          )}
        </div>
      </div>
    );
  };

  const buildMenu = () => {
    return (
      <Fragment>
        <MenuSeparator />
        <div className="flex flex-col">
          {/* <MenuItem>
            <MenuLink path="/public-profile/profiles/default">
              <MenuIcon className="menu-icon">
                <KeenIcon icon="badge" />
              </MenuIcon>
              <MenuTitle>
                <FormattedMessage id="USER.MENU.PUBLIC_PROFILE" />
              </MenuTitle>
            </MenuLink>
          </MenuItem> */}
          <MenuItem>
            <MenuLink path="/account/home/user-profile">
              <MenuIcon>
                <KeenIcon icon="profile-circle" />
              </MenuIcon>
              <MenuTitle>
                My Profile
              </MenuTitle>
            </MenuLink>
          </MenuItem>
          <MenuItem
            toggle="dropdown"
            trigger="hover"
            dropdownProps={{
              placement: isRTL() ? 'left-start' : 'right-start',
              modifiers: [
                {
                  name: 'offset',
                  options: {
                    offset: isRTL() ? [50, 0] : [-50, 0] // [skid, distance]
                  }
                }
              ]
            }}
          >
            {/*   <MenuLink>
              <MenuIcon>
                <KeenIcon icon="setting-2" />
              </MenuIcon>
              <MenuTitle>
                <FormattedMessage id="USER.MENU.MY_ACCOUNT" />
              </MenuTitle>
              <MenuArrow>
                <KeenIcon icon="right" className="text-3xs rtl:transform rtl:rotate-180" />
              </MenuArrow>
            </MenuLink> */}
            {/*     <MenuSub className="menu-default light:border-gray-300 w-[200px]] md:w-[220px]">
              <MenuItem>
                <MenuLink path="/account/home/get-started">
                  <MenuIcon>
                    <KeenIcon icon="coffee" />
                  </MenuIcon>
                  <MenuTitle>
                    <FormattedMessage id="USER.MENU.GET_STARTED" />
                  </MenuTitle>
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink path="/account/home/user-profile">
                  <MenuIcon>
                    <KeenIcon icon="some-files" />
                  </MenuIcon>
                  <MenuTitle>
                    <FormattedMessage id="USER.MENU.MY_PROFILE" />
                  </MenuTitle>
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink path="/account/billing/basic">
                  <MenuIcon>
                    <KeenIcon icon="icon" />
                  </MenuIcon>
                  <MenuTitle>
                    <FormattedMessage id="USER.MENU.BILLING" />
                  </MenuTitle>
                  <DefaultTooltip
                    title={<FormattedMessage id="USER.MENU.PAYMENT_&_SUBSCRIPTION_INFO" />}
                    placement="top"
                    className="max-w-48"
                  >
                    <KeenIcon icon="information-2" className="text-gray-500 text-md" />
                  </DefaultTooltip>
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink path="/account/security/overview">
                  <MenuIcon>
                    <KeenIcon icon="medal-star" />
                  </MenuIcon>
                  <MenuTitle>
                    <FormattedMessage id="USER.MENU.SECURITY" />
                  </MenuTitle>
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink path="/account/members/teams">
                  <MenuIcon>
                    <KeenIcon icon="setting" />
                  </MenuIcon>
                  <MenuTitle>
                    <FormattedMessage id="USER.MENU.MEMBERS_&_ROLES" />
                  </MenuTitle>
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink path="/account/integrations">
                  <MenuIcon>
                    <KeenIcon icon="switch" />
                  </MenuIcon>
                  <MenuTitle>
                    <FormattedMessage id="USER.MENU.INTEGRATIONS" />
                  </MenuTitle>
                </MenuLink>
              </MenuItem>
              <MenuSeparator />
              <MenuItem>
                <MenuLink path="/account/security/overview">
                  <MenuIcon>
                    <KeenIcon icon="shield-tick" />
                  </MenuIcon>
                  <MenuTitle>
                    <FormattedMessage id="USER.MENU.NOTIFICATIONS" />
                  </MenuTitle>
                  <label className="switch switch-sm">
                    <input name="check" type="checkbox" checked onChange={() => {}} value="1" />
                  </label>
                </MenuLink>
              </MenuItem>
            </MenuSub> */}
          </MenuItem>


          <MenuSeparator />
        </div>
      </Fragment>
    );
  };

  const buildFooter = () => {
    return (
      <div className="flex flex-col">
        {/*  <div className="menu-item mb-0.5">
          <div className="menu-link">
            <span className="menu-icon">
              <KeenIcon icon="moon" />
            </span>
            <span className="menu-title">
              <FormattedMessage id="USER.MENU.DARK_MODE" />
            </span>
            <label className="switch switch-sm">
              <input
                name="theme"
                type="checkbox"
                checked={settings.themeMode === 'dark'}
                onChange={handleThemeMode}
                value="1"
              />
            </label>
          </div>
        </div> */}

        <div className="menu-item px-4 py-1.5">
          <a onClick={logout} className="btn btn-sm btn-light justify-center">
            <FormattedMessage id="USER.MENU.LOGOUT" />
          </a>
        </div>
      </div>
    );
  };

  return (
    <MenuSub
      className="menu-default light:border-gray-300 w-[200px] md:w-[250px]"
      rootClassName="p-0"
    >
      {buildHeader()}
      {buildMenu()}
      {buildFooter()}
    </MenuSub>
  );
};

export { DropdownUser };
