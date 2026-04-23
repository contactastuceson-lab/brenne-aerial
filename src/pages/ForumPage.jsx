import PublicLayout from '@/components/layout/PublicLayout';
import Forum from '@/components/forum/Forum';

const ForumPage = () => {
  return (
    <PublicLayout>
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Forum />
        </div>
      </div>
    </PublicLayout>
  );
};

export default ForumPage;
