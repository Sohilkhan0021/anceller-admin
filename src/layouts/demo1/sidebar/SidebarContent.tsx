import { SidebarMenu } from './';

interface Props {
  height?: number;
}

const SidebarContent = ({ height = 0 }: Props) => {
  return (
    <div className="sidebar-content flex flex-col grow shrink-0 min-h-0 py-5 pe-2">
      <div
        className="scrollable-y-hover flex flex-col min-h-0 ps-2 lg:ps-5 pe-1 lg:pe-3"
        style={{
          ...(height > 0 && { 
            maxHeight: `${Math.max(0, height - 0)}px` 
          })
        }}
      >
        <SidebarMenu />
      </div>
    </div>
  );
};

export { SidebarContent };
