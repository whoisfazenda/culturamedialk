import AdminSidebar from '@/components/AdminSidebar';
import LayoutWrapper from '@/components/LayoutWrapper';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LayoutWrapper sidebar={<AdminSidebar />}>
      {children}
    </LayoutWrapper>
  );
}