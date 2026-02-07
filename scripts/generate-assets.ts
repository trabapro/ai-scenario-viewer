import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

const PUBLIC_DIR = path.resolve(import.meta.dirname, "..", "public");

// ── Helpers ──────────────────────────────────────────────────────────

async function fetchFont(
  weight: number
): Promise<{ name: string; data: ArrayBuffer; weight: number; style: string }> {
  // Use a non-browser User-Agent so Google Fonts returns TTF (not woff2).
  // Satori's opentype.js parser only supports TTF/OTF, not woff2.
  const url = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
  const cssRes = await fetch(url, {
    headers: { "User-Agent": "node" },
  });
  const css = await cssRes.text();

  // Extract the TTF URL from the CSS
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

// ── Beaker icon path (used in both OG image and favicon) ─────────

// A simple laboratory beaker / flask SVG path
const BEAKER_PATH =
  "M8 2V1a1 1 0 0 1 2 0v1h2V1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 1 1v2a1 1 0 0 1-.293.707L12 9.414V14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9.414L1.293 6.707A1 1 0 0 1 1 6V3a1 1 0 0 1 1-2h6z";

// ── OG Image Generator (1200x630) ───────────────────────────────

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
        flexDirection: "column",
        width: "100%",
        height: "100%",
        backgroundColor: "#0a0a0a",
        fontFamily: "Inter",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // Background gradient overlay
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(59,130,246,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(139,92,246,0.08) 0%, transparent 50%)",
              display: "flex",
            },
          },
        },
        // Dot grid texture
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              display: "flex",
            },
          },
        },
        // Main content
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              padding: "60px 72px",
              position: "relative",
              zIndex: 1,
              flex: 1,
            },
            children: [
              // Top row: beaker icon
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "40px",
                  },
                  children: [
                    // Beaker container with glow
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "56px",
                          height: "56px",
                          borderRadius: "14px",
                          backgroundColor: "rgba(59,130,246,0.15)",
                          border: "1px solid rgba(59,130,246,0.3)",
                          boxShadow:
                            "0 0 24px rgba(59,130,246,0.2), 0 0 48px rgba(59,130,246,0.1)",
                        },
                        children: [
                          {
                            type: "svg",
                            props: {
                              width: 28,
                              height: 28,
                              viewBox: "0 0 24 24",
                              fill: "none",
                              stroke: "#3b82f6",
                              strokeWidth: "2",
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              style: { display: "flex" },
                              children: [
                                // Flask body
                                {
                                  type: "path",
                                  props: {
                                    d: "M9 3h6V8.5l4.5 7.5a2 2 0 0 1-1.72 3H6.22a2 2 0 0 1-1.72-3L9 8.5V3z",
                                  },
                                },
                                // Liquid line
                                {
                                  type: "path",
                                  props: {
                                    d: "M6.5 15h11",
                                  },
                                },
                                // Top cap
                                {
                                  type: "path",
                                  props: {
                                    d: "M8 3h8",
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
              // Subtitle: "Traba"
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontSize: "22px",
                    fontWeight: 600,
                    color: "rgba(139,92,246,0.8)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  },
                  children: "Traba",
                },
              },
              // Main title
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontSize: "56px",
                    fontWeight: 700,
                    color: "#ffffff",
                    lineHeight: 1.15,
                    letterSpacing: "-0.025em",
                  },
                  children: "AI Scenario Tests",
                },
              },
              // Description
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontSize: "20px",
                    fontWeight: 400,
                    color: "rgba(255,255,255,0.5)",
                    marginTop: "16px",
                    lineHeight: 1.5,
                  },
                  children:
                    "Visualize and compare AI scenario test results across environments",
                },
              },
              // Spacer
              {
                type: "div",
                props: {
                  style: { display: "flex", flex: 1 },
                },
              },
              // Bottom stat cards
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    gap: "20px",
                  },
                  children: [
                    createStatCard("Scenarios", "24", "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"),
                    createStatCard("Criteria", "156", "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"),
                    createStatCard("Pass Rate", "94.2%", "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"),
                  ],
                },
              },
            ],
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

function createStatCard(label: string, value: string, iconPath: string) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        padding: "20px 28px",
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        minWidth: "180px",
        gap: "8px",
      },
      children: [
        // Icon + label row
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "8px",
            },
            children: [
              {
                type: "svg",
                props: {
                  width: 16,
                  height: 16,
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "rgba(255,255,255,0.4)",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  style: { display: "flex" },
                  children: [
                    {
                      type: "path",
                      props: { d: iconPath },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.45)",
                    letterSpacing: "0.02em",
                  },
                  children: label,
                },
              },
            ],
          },
        },
        // Value
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontSize: "32px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            },
            children: value,
          },
        },
      ],
    },
  };
}

// ── Favicon Generator ───────────────────────────────────────────

async function generateFavicons(
  fonts: Awaited<ReturnType<typeof fetchFont>>[]
): Promise<void> {
  const size = 512; // Render at high res, then downscale

  const element = {
    type: "div",
    props: {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#0a0a0a",
        borderRadius: "96px", // Rounded corners at 512px
      },
      children: [
        {
          type: "svg",
          props: {
            width: 300,
            height: 300,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "#3b82f6",
            strokeWidth: "1.8",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            style: { display: "flex" },
            children: [
              // Flask body
              {
                type: "path",
                props: {
                  d: "M9 3h6V8.5l4.5 7.5a2 2 0 0 1-1.72 3H6.22a2 2 0 0 1-1.72-3L9 8.5V3z",
                },
              },
              // Liquid line
              {
                type: "path",
                props: {
                  d: "M6.5 15h11",
                },
              },
              // Top cap
              {
                type: "path",
                props: {
                  d: "M8 3h8",
                },
              },
              // Bubbles
              {
                type: "circle",
                props: {
                  cx: "10",
                  cy: "17",
                  r: "0.5",
                  fill: "#3b82f6",
                },
              },
              {
                type: "circle",
                props: {
                  cx: "13",
                  cy: "16",
                  r: "0.7",
                  fill: "#3b82f6",
                },
              },
            ],
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

  // Generate SVG favicon
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <rect width="32" height="32" rx="6" fill="#0a0a0a"/>
  <g transform="translate(4, 3) scale(1)" fill="none" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 3h6V8.5l4.5 7.5a2 2 0 0 1-1.72 3H6.22a2 2 0 0 1-1.72-3L9 8.5V3z"/>
    <path d="M6.5 15h11"/>
    <path d="M8 3h8"/>
    <circle cx="10" cy="17" r="0.5" fill="#3b82f6"/>
    <circle cx="13" cy="16" r="0.7" fill="#3b82f6"/>
  </g>
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
