import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { headers } from 'next/headers';
import { Providers } from '@/components/Providers';

const montserrat = Montserrat({ subsets: ['latin', 'cyrillic'], variable: '--font-montserrat' });

export const metadata: Metadata = {
  title: 'Личный кабинет артиста | Cultura Media',
  description: 'Платформа для дистрибуции музыки',
  icons: {
    icon: '/logo.png', // Используем ваш логотип как иконку
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const heads = headers();
  const pathname = heads.get('next-url') || '';
  // Note: getting pathname in Server Component layout is tricky in Next 14 without middleware.
  // A cleaner way is to move the Artist layout to a (artist) group.
  // But for now, let's use a client wrapper or just accept the sidebar is there
  // OR: Use CSS to hide it on admin pages? No.
  
  // Let's restructure to Route Groups for cleaner separation.
  // Move current page.tsx, upload/, releases/ etc to (artist) folder.
  // But that requires moving many files.

  // Alternative: Make a Client Layout Wrapper that checks usePathname.
  
  return (
    <html lang="ru">
      <body className={montserrat.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}