export const BattlepassLoader = () => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center">
      <svg
        className="text-foreground animate-spin-slow"
        width={256}
        height={256}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--r-primary))"
          strokeWidth="8"
          strokeDasharray="70 30"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke="hsl(var(--r-foreground))"
          strokeWidth="6"
          strokeDasharray="40 60"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pulse"
        />

        <g transform="translate(30, 30) scale(2)" className="animate-pulse">
          <path
            d="M3.54688 9.18333V13.325C3.54688 14.8417 3.54687 14.8417 4.98021 15.8083L8.92187 18.0833C9.51354 18.425 10.4802 18.425 11.0719 18.0833L15.0135 15.8083C16.4469 14.8417 16.4469 14.8417 16.4469 13.325V9.18333C16.4469 7.66666 16.4469 7.66666 15.0135 6.7L11.0719 4.425C10.4802 4.08333 9.51354 4.08333 8.92187 4.425L4.98021 6.7C3.54687 7.66666 3.54688 7.66666 3.54688 9.18333Z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            stroke="hsl(var(--r-foreground))"
          />
          <path
            d="M14.5807 6.35834V4.16667C14.5807 2.50001 13.7474 1.66667 12.0807 1.66667H7.91406C6.2474 1.66667 5.41406 2.50001 5.41406 4.16667V6.3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            stroke="hsl(var(--r-foreground))"
          />
          <path
            d="M10.5264 9.15833L11.0014 9.9C11.0764 10.0167 11.2431 10.1333 11.3681 10.1667L12.2181 10.3833C12.7431 10.5167 12.8848 10.9667 12.5431 11.3833L11.9848 12.0583C11.9014 12.1667 11.8348 12.3583 11.8431 12.4917L11.8931 13.3667C11.9264 13.9083 11.5431 14.1833 11.0431 13.9833L10.2264 13.6583C10.1014 13.6083 9.89311 13.6083 9.76811 13.6583L8.95144 13.9833C8.45144 14.1833 8.06811 13.9 8.10144 13.3667L8.15144 12.4917C8.15978 12.3583 8.09311 12.1583 8.00978 12.0583L7.45144 11.3833C7.10978 10.9667 7.25144 10.5167 7.77644 10.3833L8.62644 10.1667C8.75978 10.1333 8.92644 10.0083 8.99311 9.9L9.46811 9.15833C9.76811 8.70833 10.2348 8.70833 10.5264 9.15833Z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            stroke="hsl(var(--r-foreground))"
          />
        </g>
      </svg>
    </div>
  );
};
