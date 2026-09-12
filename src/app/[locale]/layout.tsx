import type { Metadata } from 'next';
import { Inter, Kantumruy_Pro } from 'next/font/google';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const kantumruy = Kantumruy_Pro({
  subsets: ['khmer', 'latin'],
  variable: '--font-kantumruy',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Smart School & Student Management System',
  description: 'Enterprise Student Information and Management System',
  icons: {
    icon: '/favicon.ico',
  },
};

export function generateStaticParams() {
  return [{ locale: 'km' }, { locale: 'en' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <html lang={locale} className={`dark ${inter.variable} ${kantumruy.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('app_theme');
                  var theme = saved || 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 dark:bg-[#131417] text-slate-900 dark:text-zinc-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
