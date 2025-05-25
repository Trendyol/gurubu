import React from "react";

const PLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="40"
    viewBox="0 0 32 40"
    fill="none"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.0353404 40.0001L10.909 33.7528L10.9188 15.65H0L0.0353404 40.0001Z"
      fill="url(#paint0_linear)"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 0V11.949L32 21.493V9.03459L16 0Z"
      fill="url(#paint1_linear)"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 30.6197V18.6702L32 9.03149V21.4899L16 30.6197Z"
      fill="#EF6114"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 0V11.949L0 21.493V9.03459L16 0Z"
      fill="#EF6114"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 30.6197V18.6702L0 9.03149V21.4899L16 30.6197Z"
      fill="#C24E4C"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 30.6197V18.6703L0 9.03137V21.4899L16 30.6197Z"
      fill="url(#paint2_linear)"
    />
    <defs>
      <linearGradient
        id="paint0_linear"
        x1="0"
        y1="50.3452"
        x2="4.47714"
        y2="27.162"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FACAA3" />
        <stop offset="1" stopColor="#F27A1A" />
      </linearGradient>
      <linearGradient
        id="paint1_linear"
        x1="-4.95775"
        y1="3.82014"
        x2="28.8626"
        y2="21.1809"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FACAA3" />
        <stop offset="1" stopColor="#F27A1A" />
      </linearGradient>
      <linearGradient
        id="paint2_linear"
        x1="-20.9577"
        y1="12.8685"
        x2="12.9249"
        y2="30.1843"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FACAA3" />
        <stop offset="1" stopColor="#F27A1A" />
      </linearGradient>
    </defs>
  </svg>
);

export default PLogo;
