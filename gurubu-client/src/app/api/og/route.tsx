import { ImageResponse } from "next/og";
import { CSSProperties } from "react";

export const runtime = "edge";

const imageStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  backgroundSize: "150px 150px",
  height: "100%",
  width: "100%",
  display: "flex",
  textAlign: "center",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  flexWrap: "nowrap",
  fontSize: "48px",
};

const imageSize = {
  width: 1200,
  height: 630,
};

export async function GET(request: Request) {
  try {
    const imageData = await fetch(
      new URL("../../../../public/logo-with-text.png", import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div style={imageStyle}>
          {imageData && (
            <img width={372} height={90} src={imageData as unknown as string} />
          )}
          Simple, fast and practical grooming.
        </div>
      ),
      imageSize
    );
  } catch (e: any) {
    return new ImageResponse(
      (
        <div style={imageStyle}>
          <h1>GuruBu</h1>
          Simple, fast and practical grooming.
        </div>
      ),
      imageSize
    );
  }
}
