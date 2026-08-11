
import type { Metadata, Viewport } from "next";
import "./globals.css";

const APP_NAME = "Champion Assistant";
const DEVELOPER = "ABDUL MATEEN";

export const metadata: Metadata = {
  metadataBase: new URL("https://champion-assistant.vercel.app"),

  title: {
    default: `${APP_NAME} — Your Intelligent Notes Workspace`,
    template: `%s | ${APP_NAME}`,
  },

  description:
    "Champion Assistant is a premium, private and intelligent notes workspace for writing, organizing, searching and transforming your ideas.",

  applicationName: APP_NAME,

  authors: [
    {
      name: DEVELOPER,
    },
  ],

  creator: DEVELOPER,
  publisher: DEVELOPER,

  keywords: [
    "Champion Assistant",
    "AI notes",
    "smart notes",
    "AI study assistant",
    "notes app",
    "online notepad",
    "private notes",
    "productivity",
    "Abdul Mateen",
  ],

  category: "productivity",

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  manifest: "/manifest.webmanifest",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: APP_NAME,
    title: `${APP_NAME} — Your Intelligent Notes Workspace`,
    description:
      "Write, organize, search and transform your ideas inside a premium intelligent workspace.",
  },

  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — Your Intelligent Notes Workspace`,
    description:
      "A premium intelligent workspace for notes, ideas and productivity.",
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",

  themeColor: [
    {
      media: "(prefers-color-scheme: dark)",
      color: "#04040b",
    },
    {
      media: "(prefers-color-scheme: light)",
      color: "#04040b",
    },
  ],

  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark"
      suppressHydrationWarning
    >
      <head>
        {/* Premium browser UI */}
        <meta
          name="theme-color"
          content="#04040b"
          media="(prefers-color-scheme: dark)"
        />

        <meta
          name="theme-color"
          content="#04040b"
          media="(prefers-color-scheme: light)"
        />

        <meta name="mobile-web-app-capable" content="yes" />

        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        <meta
          name="apple-mobile-web-app-title"
          content={APP_NAME}
        />

        {/* Prevent accidental telephone/email detection */}
        <meta
          name="format-detection"
          content="telephone=no, email=no, address=no"
        />

        {/* Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="dns-prefetch"
          href="https://fonts.googleapis.com"
        />

        {/* Premium app identity */}
        <meta name="application-name" content={APP_NAME} />
        <meta name="author" content={DEVELOPER} />
      </head>

      <body
        className="
          min-h-screen
          overflow-x-hidden
          bg-[#04040b]
          text-white
          antialiased
          selection:bg-purple-500/40
          selection:text-white
        "
      >
        {/* Global application shell */}
        <div
          id="app-shell"
          className="relative min-h-screen"
        >
          {children}
        </div>

        {/* Accessibility fallback */}
        <noscript>
          <div
            style={{
              padding: "24px",
              minHeight: "100vh",
              background: "#050b04",
              color: "#fff",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <h1>{APP_NAME}</h1>
            <p>
              JavaScript is required to use Champion Assistant.
            </p>
          </div>
        </noscript>
      </body>
    </html>
  );
}
