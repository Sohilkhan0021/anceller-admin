import { useState } from 'react';
import { MEPManagementHeader } from './blocks/MEPManagementHeader';
import { ProjectManagement } from './blocks/ProjectManagement';
import { ProjectItemManagement } from './blocks/ProjectItemManagement';
import { ItemsManagement } from './blocks/ItemsManagement';
import { Tabs, TabsList, Tab, TabPanel } from '@/components/tabs';
import { KeenIcon } from '@/components';

const MEPManagementContent = () => {
  const [activeTab, setActiveTab] = useState('projects');

  return (
    <div className="grid gap-5 lg:gap-7.5 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <MEPManagementHeader />

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onChange={(event, newValue) => setActiveTab(String(newValue) || 'projects')}
        className="w-full max-w-full overflow-x-hidden"
      >
        <TabsList className="grid w-full grid-cols-3">
          <Tab value="projects">
            <KeenIcon icon="category" className="me-2" />
            Project
          </Tab>
          <Tab value="project-items">
            <KeenIcon icon="tag" className="me-2" />
            Project Item
          </Tab>
          <Tab value="items">
            <KeenIcon icon="category" className="me-2" />
            Items
          </Tab>
        </TabsList>

        {/* Projects Tab */}
        <TabPanel value="projects" className="mt-6 w-full max-w-full">
          <ProjectManagement />
        </TabPanel>

        {/* Project Items Tab */}
        <TabPanel value="project-items" className="mt-6 w-full max-w-full overflow-x-hidden">
          <ProjectItemManagement />
        </TabPanel>

        {/* Items Tab */}
        <TabPanel value="items" className="mt-6 w-full max-w-full">
          <ItemsManagement />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export { MEPManagementContent };
