import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

const PUBLIC_DIR = path.resolve(import.meta.dirname, "..", "public");

// ── Traba Brand Colors ──────────────────────────────────────────────
const BRAND = {
  Violet: "#8000FF",
  TrabaBlue: "#8893FF",
  MidnightBlue: "#08105E",
  White: "#FFFFFF",
  Violet10: "#F5EBFF",
  Violet40: "#B366FF",
  Grey90: "#2B333B",
};

// ── Helpers ──────────────────────────────────────────────────────────

async function fetchFont(
  weight: number
): Promise<{ name: string; data: ArrayBuffer; weight: number; style: string }> {
  const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
  const cssRes = await fetch(url, {
    headers: { "User-Agent": "node" },
  });
  const css = await cssRes.text();

  const match = css.match(/src:\s*url\(([^)]+)\)/);
  if (!match) throw new Error(`Could not find font URL for weight ${weight}`);

  const fontRes = await fetch(match[1]);
  const data = await fontRes.arrayBuffer();
  return { name: "Inter", data, weight, style: "normal" as const };
}

function svgToPng(svg: string, width: number, height: number): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width" as const, value: width },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}

// ── OG Image Generator (1200x630) ───────────────────────────────
// Design: Bold split layout. Left side is a thick Violet vertical band.
// Right side has white background with oversized bold typography.
// "TRABA" wordmark at top, massive "AI Scenario Tests" hero text.
// Clean, premium, high-impact.

async function generateOGImage(
  fonts: Awaited<ReturnType<typeof fetchFont>>[]
): Promise<void> {
  const width = 1200;
  const height = 630;

  const element = {
    type: "div",
    props: {
      style: {
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: BRAND.White,
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // Left: bold violet band
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              width: "100px",
              height: "100%",
              backgroundColor: BRAND.Violet,
              flexShrink: 0,
            },
          },
        },
        // Main content area
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "60px 72px 60px 64px",
              position: "relative",
            },
            children: [
              // Top: TRABA wordmark
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "24px",
                  },
                  children: [
                    // Violet dot accent
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          width: "14px",
                          height: "14px",
                          borderRadius: "7px",
                          backgroundColor: BRAND.Violet,
                        },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontSize: "24px",
                          fontWeight: 800,
                          color: BRAND.Violet,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                        },
                        children: "Traba",
                      },
                    },
                  ],
                },
              },
              // Spacer to push title to vertical center
              {
                type: "div",
                props: {
                  style: { display: "flex", flex: 1 },
                },
              },
              // Hero text: AI Scenario Tests -- MASSIVE and BOLD
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    gap: "0px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontSize: "96px",
                          fontWeight: 900,
                          color: BRAND.MidnightBlue,
                          lineHeight: 1.0,
                          letterSpacing: "-0.04em",
                        },
                        children: "AI Scenario",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          fontSize: "96px",
                          fontWeight: 900,
                          color: BRAND.Violet,
                          lineHeight: 1.0,
                          letterSpacing: "-0.04em",
                        },
                        children: "Tests",
                      },
                    },
                  ],
                },
              },
              // Spacer
              {
                type: "div",
                props: {
                  style: { display: "flex", flex: 1 },
                },
              },
              // Bottom: subtle tagline
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontSize: "20px",
                    fontWeight: 500,
                    color: "#7A8A99",
                    letterSpacing: "0.01em",
                  },
                  children: "Visualize & compare test results across environments",
                },
              },
            ],
          },
        },
        // Right edge: decorative TrabaBlue accent stripe
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute",
              top: 0,
              right: 0,
              width: "12px",
              height: "100%",
              backgroundColor: BRAND.TrabaBlue,
            },
          },
        },
        // Decorative: large faded violet circle in bottom-right
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute",
              bottom: "-120px",
              right: "-60px",
              width: "380px",
              height: "380px",
              borderRadius: "190px",
              backgroundColor: BRAND.Violet10,
              opacity: 0.6,
            },
          },
        },
        // Decorative: smaller accent circle
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              position: "absolute",
              top: "40px",
              right: "60px",
              width: "80px",
              height: "80px",
              borderRadius: "40px",
              border: `4px solid ${BRAND.Violet40}`,
              opacity: 0.3,
            },
          },
        },
      ],
    },
  };

  const svg = await satori(element as any, {
    width,
    height,
    fonts,
  });

  const png = svgToPng(svg, width, height);
  const outPath = path.join(PUBLIC_DIR, "og-image.png");
  fs.writeFileSync(outPath, png);
  console.log(`  Generated ${outPath} (${(png.length / 1024).toFixed(1)} KB)`);
}

// ── Favicon Generator ───────────────────────────────────────────
// Design: Bold violet square with rounded corners, white "T" lettermark.
// Instantly recognizable at any size.

async function generateFavicons(
  fonts: Awaited<ReturnType<typeof fetchFont>>[]
): Promise<void> {
  const size = 512;

  const element = {
    type: "div",
    props: {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: BRAND.Violet,
        borderRadius: "96px",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: "340px",
              fontWeight: 900,
              color: BRAND.White,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              marginTop: "-20px",
            },
            children: "T",
          },
        },
      ],
    },
  };

  const svg = await satori(element as any, {
    width: size,
    height: size,
    fonts,
  });

  const pngBuf = svgToPng(svg, size, size);

  // Generate SVG favicon -- bold violet square with white T
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="6" fill="${BRAND.Violet}"/>
  <text x="16" y="26" text-anchor="middle" font-family="Inter, Helvetica, Arial, sans-serif" font-weight="900" font-size="26" fill="${BRAND.White}">T</text>
</svg>`;

  // Write SVG favicon
  const svgPath = path.join(PUBLIC_DIR, "favicon.svg");
  fs.writeFileSync(svgPath, faviconSvg);
  console.log(`  Generated ${svgPath}`);

  // Generate PNG favicons at various sizes using sharp
  const sizes: { name: string; size: number }[] = [
    { name: "favicon-32x32.png", size: 32 },
    { name: "favicon-16x16.png", size: 16 },
    { name: "apple-touch-icon.png", size: 180 },
  ];

  for (const { name, size: targetSize } of sizes) {
    const resizedBuf = await sharp(pngBuf)
      .resize(targetSize, targetSize, { fit: "cover" })
      .png()
      .toBuffer();

    const outPath = path.join(PUBLIC_DIR, name);
    fs.writeFileSync(outPath, resizedBuf);
    console.log(
      `  Generated ${outPath} (${targetSize}x${targetSize}, ${(resizedBuf.length / 1024).toFixed(1)} KB)`
    );
  }
}

// ── Main ─────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log("Fetching Inter font from Google Fonts...");
  const fonts = await Promise.all([
    fetchFont(400),
    fetchFont(500),
    fetchFont(600),
    fetchFont(700),
    fetchFont(800),
    fetchFont(900),
  ]);

  console.log("\nGenerating OG image (1200x630)...");
  await generateOGImage(fonts);

  console.log("\nGenerating favicons...");
  await generateFavicons(fonts);

  console.log("\nAll assets generated successfully.");
}

main().catch((err) => {
  console.error("Asset generation failed:", err);
  process.exit(1);
});
