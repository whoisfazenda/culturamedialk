import Sidebar from '@/components/Sidebar';
import LayoutWrapper from '@/components/LayoutWrapper';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function ArtistLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userId = cookies().get('user_id')?.value;

  if (!userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isAdmin = user?.role === 'ADMIN';

  return (
    <LayoutWrapper sidebar={<Sidebar isAdmin={isAdmin} />}>
      {children}
    </LayoutWrapper>
  );
}