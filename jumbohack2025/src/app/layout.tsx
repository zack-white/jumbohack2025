import type { Metadata } from "next";
import { IBM_Plex_Serif, Inter } from "next/font/google";
import "./globals.css";
import NavBar from '../components/NavBar';

const ibmPlexSerif = IBM_Plex_Serif({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-serif',
})

const inter = Inter({
    weight: ['400', '500', '600', '700', '800', '900'],
    subsets: ['latin'],
    variable: '--font-inter',
  })

export const metadata: Metadata = {
  title: "JumboMap",
  description: "Making events more accessible",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
    <html lang="en">
        <body
        className={`${ibmPlexSerif.variable} ${inter.variable}`}
        >
        <NavBar />
        {children}
        </body>
    </html>
    );
}

module.exports = {
    theme: {
        extend: {
            fontFamily: {
                serif: "var(--font-ibm-plex-serif)",
                inter: "var(--font-inter)",
            },
        },
    },
};