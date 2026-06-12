import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Bare layout for the /demo/* screens that the landing page embeds in
 * iframes. No header or footer: only the app screen itself.
 */
export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex min-h-screen flex-col">{children}</div>;
}
