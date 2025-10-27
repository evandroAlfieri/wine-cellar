import { useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { StatsBar } from '@/components/StatsBar';
import { BottleList } from '@/components/BottleList';
import { WishlistList } from '@/components/WishlistList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Layers, Heart } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('collection');

  return (
    <ProtectedRoute>
      <Layout>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto mb-6 grid-cols-3">
            <TabsTrigger value="collection" className="gap-2">
              <Layers className="w-4 h-4" />
              <span>Collection</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span>Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-2">
              <Heart className="w-4 h-4" />
              <span>Wishlist</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="collection" className="mt-0">
            <BottleList onViewStats={() => setActiveTab('statistics')} />
          </TabsContent>
          
          <TabsContent value="statistics" className="mt-0">
            {activeTab === 'statistics' && <StatsBar />}
          </TabsContent>
          
          <TabsContent value="wishlist" className="mt-0">
            <WishlistList />
          </TabsContent>
        </Tabs>
      </Layout>
    </ProtectedRoute>
  );
};

export default Index;
