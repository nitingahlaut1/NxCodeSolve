import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ProgressProvider } from '@/context/ProgressContext';

export const metadata: Metadata = {
  title: "NxCodeSolve - Striver's A2Z DSA Sheet 476 Tracker",
  description: 'Track, solve, and master all 476 DSA problems from Striver A2Z DSA Sheet with progress analytics, notes, and file-based authentication.',
  keywords: ['DSA', 'LeetCode', 'Striver A2Z', 'Data Structures', 'Algorithms', 'Interview Preparation', 'NxCodeSolve', 'Nxcodesolve']
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <ProgressProvider>
              {children}
            </ProgressProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
