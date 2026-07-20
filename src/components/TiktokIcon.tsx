import React from "react";

export function TiktokIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 448 512"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25v178.72a162.55 162.55 0 1 1-250-135.79 161.57 161.57 0 0 1 58.24-11.33v90.4a71.8 71.8 0 1 0 42.4 64.12V0h90.41a108.94 108.94 0 0 0 108.41 108.41v90.41a108.13 108.13 0 0 1-26.69-10.91z" />
    </svg>
  );
}
