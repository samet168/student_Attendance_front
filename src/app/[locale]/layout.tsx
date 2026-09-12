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

                // Filter out browser extension hydration warnings (e.g. Bitdefender bis_skin_checked)
                if (typeof window !== 'undefined') {
                  var origError = console.error;
                  console.error = function() {
                    var msg = arguments[0];
                    if (typeof msg === 'string' && (
                      msg.indexOf('bis_skin_checked') !== -1 ||
                      msg.indexOf('bis_register') !== -1 ||
                      msg.indexOf('extra attributes from the server') !== -1
                    )) {
                      return;
                    }
                    origError.apply(console, arguments);
                  };
                }
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 dark:bg-[#131417] text-slate-900 dark:text-zinc-100 font-sans antialiased selection:bg-blue-600 selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}
