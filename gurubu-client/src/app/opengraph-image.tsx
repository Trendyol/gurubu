import { ImageResponse } from "next/og";
import { CSSProperties } from "react";

export const contentType = "image/png";

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

export const size = {
  width: 1200,
  height: 630,
};

export default async function Image() {
  return new ImageResponse(
    (
      <div style={imageStyle}>
        <img
          width={372}
          height={90}
          src={"https://gurubu.vercel.app/gurubu-logo.svg"}
          alt="GuruBu logo"
        />
        Simple, fast and practical grooming.
      </div>
    ),
    {
      ...size,
    }
  );
}
