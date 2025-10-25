import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuestLayout } from '@/components/GuestLayout';
import { BottleList } from '@/components/BottleList';
import { WishlistList } from '@/components/WishlistList';

export default function GuestView() {
  const [activeTab, setActiveTab] = useState('collection');

  return (
    <GuestLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="collection">Collection</TabsTrigger>
          <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
        </TabsList>

        <TabsContent value="collection" className="space-y-4">
          <BottleList isReadOnly={true} />
        </TabsContent>

        <TabsContent value="wishlist" className="space-y-4">
          <WishlistList isReadOnly={true} />
        </TabsContent>
      </Tabs>
    </GuestLayout>
  );
}
