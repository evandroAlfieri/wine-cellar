import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { StatsBar } from '@/components/StatsBar';
import { BottleList } from '@/components/BottleList';

const Index = () => {
  return (
    <ProtectedRoute>
      <Layout>
        <StatsBar />
        <BottleList />
      </Layout>
    </ProtectedRoute>
  );
};

export default Index;
