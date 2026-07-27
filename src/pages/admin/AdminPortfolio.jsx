import React, { useState } from 'react';
import { Map, Film, GitCompare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProjectsTab from '@/components/admin/portfolio/ProjectsTab';
import MapProjectsTab from '@/components/admin/portfolio/MapProjectsTab';
import BeforeAfterTab from '@/components/admin/portfolio/BeforeAfterTab';

export default function AdminPortfolio() {
  const [tab, setTab] = useState('projects');

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-grotesk font-bold text-2xl">Portfolio</h1>
        <p className="font-inter text-sm text-muted-foreground">Gérez les projets, la carte interactive et les comparaisons avant/après.</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="projects" className="gap-1.5"><Film className="w-3.5 h-3.5" /> Projets</TabsTrigger>
          <TabsTrigger value="map" className="gap-1.5"><Map className="w-3.5 h-3.5" /> Carte</TabsTrigger>
          <TabsTrigger value="beforeafter" className="gap-1.5"><GitCompare className="w-3.5 h-3.5" /> Avant/Après</TabsTrigger>
        </TabsList>
        <TabsContent value="projects" className="mt-6"><ProjectsTab /></TabsContent>
        <TabsContent value="map" className="mt-6"><MapProjectsTab /></TabsContent>
        <TabsContent value="beforeafter" className="mt-6"><BeforeAfterTab /></TabsContent>
      </Tabs>
    </div>
  );
}