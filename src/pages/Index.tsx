import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { Wine, Package, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bottles</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">In your cellar</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€0.00</div>
                <p className="text-xs text-muted-foreground">Collection worth</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Wines</CardTitle>
                <Wine className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Different varieties</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <Card>
            <CardHeader>
              <CardTitle>Your Wine Collection</CardTitle>
              <CardDescription>
                Start by adding your first bottle to the cellar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wine className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bottles yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Your wine cellar is empty. Add your first bottle to start tracking your collection.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Index;
