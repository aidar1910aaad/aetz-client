import PageLoader from '@/shared/loader/PageLoader';

export function BusbarLoader() {
  return (
    <div className="h-[calc(100vh-64px)]">
      <PageLoader inline />
    </div>
  );
}
