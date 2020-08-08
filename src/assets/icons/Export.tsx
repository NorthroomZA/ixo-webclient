import React from "react";

const Export = (props: any): JSX.Element => {
  return (
    <svg
      width={props.width || 18}
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 6h3.3a.67.67 0 01.7.6.86.86 0 01-.8.7H2.5a.67.67 0 00-.7.6v8.2a.67.67 0 00.7.6h13.1a.67.67 0 00.7-.6V7.9a.67.67 0 00-.7-.6h-3.3a.67.67 0 01-.7-.6.67.67 0 01.7-.6l3.2-.1a1.92 1.92 0 012 1.9v8.2a2 2 0 01-2 1.9h-13a1.92 1.92 0 01-2-1.9V7.9a1.92 1.92 0 012-1.9zm2.7 2.8a.75.75 0 01.9 0l2.2 2V.5A.68.68 0 019 0a.67.67 0 01.7.6v10.3l2.2-2a.75.75 0 01.9 0 .75.75 0 010 .9l-3.3 3a.75.75 0 01-.9 0L5.2 9.7a.56.56 0 010-.9z"
        fill={props.fill || "#fff"}
      />
    </svg>
  );
};

export default Export;
