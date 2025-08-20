import Head from 'next/head';

export const metadata = {
  title: 'Welcome to Shikshagraha',
  description: 'Welcome to Shikshalokam',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    // move themeColor here
    themeColor: '#000000',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <meta name="theme-color" content="#000000" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
						/* Base resets */
						body, html { margin: 0; padding: 0; box-sizing: border-box; }
						*, *:before, *:after { box-sizing: inherit; }

						/* Prevent viewport resizing quirks on iOS */
						body {
							-webkit-text-size-adjust: 100%;
							-webkit-tap-highlight-color: transparent;
						}

						/* Allow text selection in form fields */
						input, textarea, select {
							-webkit-user-select: text;
							user-select: text;
							-webkit-appearance: none;
							border-radius: 0;
						}

						/* MUI label: ensure no strikethrough and sits above underline */
						.MuiFormLabel-root { text-decoration: none !important; text-decoration-skip-ink: none !important; position: relative; z-index: 2; }
						/* If background bleed causes line-through, give label a background */
						.MuiFormLabel-root.MuiInputLabel-shrink { background-color: #fff !important; padding: 0 4px; }

						/* iOS-only: prevent auto-zoom by making inputs/selects compute to >=16px */
						html.is-ios .MuiInputBase-input,
						html.is-ios .MuiOutlinedInput-input,
						html.is-ios .MuiFilledInput-input,
						html.is-ios .MuiSelect-select,
						html.is-ios input,
						html.is-ios select,
						html.is-ios textarea { font-size: 16px !important; }

						/* Visually scale MUI field wrappers back to ~14px without triggering zoom */
						html.is-ios .MuiFormControl-root,
						html.is-ios .MuiInputBase-root {
							transform: scale(0.875);
							transform-origin: top left;
							width: calc(100% / 0.875);
							will-change: transform;
						}

						/* Keep outlines/underlines stable and behind label */
						.MuiInput-underline:before, .MuiInput-underline:after { transform: none; }
						html.is-ios .MuiOutlinedInput-notchedOutline { z-index: 1; }
						html.is-ios .MuiInputLabel-root { z-index: 2; }
          `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
						(function() {
							try {
								var ua = window.navigator.userAgent || '';
								var iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
								if (iOS) {
									document.documentElement.classList.add('is-ios');
									// Prevent zoom on focus by reinforcing viewport
									var meta = document.querySelector('meta[name="viewport"]');
									if (!meta) return;
									var base = meta.getAttribute('content') || '';
									document.addEventListener('focusin', function(e){
										var t = e.target;
										if (t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) {
											meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
										}
									});
									document.addEventListener('focusout', function(){
										meta.setAttribute('content', base || 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
									});
								}
							} catch(e) {}
						})();
					`,
          }}
        />
      </Head>
      <body>{children}</body>
    </html>
  );
}
