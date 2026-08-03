import React, { useMemo } from 'react';

import { nanoid } from 'nanoid';

import { cn } from '@re/ui-kit/utils/cn';

export const LoadingIndicatorIcon = ({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) => {
  const id = useMemo(() => nanoid(), []);

  return (
    <div className={cn('text-primary', className)}>
      <svg
        data-testid="loading-indicator"
        height={size}
        viewBox="0 0 30 30"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
        className="animate-pulse-spin"
      >
        <defs>
          <linearGradient id={`${id}-linear-gradient`} x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop data-testid="stop-color" offset="100%" stopColor="currentColor" stopOpacity="1" />
          </linearGradient>
          <filter id={`${id}-glow`} height="130%" width="130%" x="-15%" y="-15%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle
          cx="15"
          cy="15"
          r="13"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeDasharray="81.68"
          strokeDashoffset="20.42"
          strokeLinecap="round"
          filter={`url(#${id}-glow)`}
        />
        <path
          d="M2.518 23.321l1.664-1.11A12.988 12.988 0 0 0 15 28c7.18 0 13-5.82 13-13S22.18 2 15 2V0c8.284 0 15 6.716 15 15 0 8.284-6.716 15-15 15-5.206 0-9.792-2.652-12.482-6.679z"
          fill={`url(#${id}-linear-gradient)`}
          fillRule="evenodd"
          opacity="0.7"
        />
      </svg>
    </div>
  );
};

export const UploadIcon = () => {
  return (
    <svg
      data-testid="attach-icon"
      fill="none"
      height="24"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Attach files</title>
      <g clipPath="url(#clip0_10878_5)">
        <path
          d="M12.9997 6.99993L10.9997 6.99993L10.9997 10.9999L6.99972 10.9999L6.99972 12.9999L10.9997 12.9999L10.9997 16.9999L12.9997 16.9999L12.9997 12.9999L16.9997 12.9999L16.9997 10.9999L12.9997 10.9999L12.9997 6.99993ZM11.9997 1.99992C6.47972 1.99992 1.99972 6.47993 1.99972 11.9999C1.99972 17.5199 6.47972 21.9999 11.9997 21.9999C17.5197 21.9999 21.9997 17.5199 21.9997 11.9999C21.9997 6.47993 17.5197 1.99992 11.9997 1.99992ZM11.9997 19.9999C7.58972 19.9999 3.99972 16.4099 3.99972 11.9999C3.99972 7.58993 7.58972 3.99993 11.9997 3.99993C16.4097 3.99993 19.9997 7.58993 19.9997 11.9999C19.9997 16.4099 16.4097 19.9999 11.9997 19.9999Z"
          fill="black"
        />
      </g>
      <defs>
        <clipPath id="clip0_10878_5">
          <rect fill="white" height="24" width="24" />
        </clipPath>
      </defs>
    </svg>
  );
};
export const AttachmentIcon = () => (
  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_14463_119014)">
      <path
        d="M11.6587 6.83331L6.94205 11.2333C6.57538 11.5833 6.36706 12.0584 6.38373 12.55C6.40039 13.0417 6.60039 13.5083 6.97539 13.85C7.35039 14.1917 7.85872 14.3917 8.38372 14.3917C8.90872 14.3917 9.40872 14.2083 9.79206 13.8666L14.6754 9.32502C15.4087 8.62502 15.8087 7.675 15.8004 6.7C15.7921 5.71667 15.3754 4.78333 14.6337 4.09166C13.8921 3.4 12.8837 3.00833 11.8337 3C10.7837 3 9.76706 3.36667 9.00872 4.05001L4.28374 8.44169C3.7254 8.95836 3.28373 9.57502 2.9754 10.2584C2.6754 10.9417 2.52539 11.6667 2.52539 12.4C2.52539 13.1334 2.68373 13.8666 2.9754 14.5416C3.28373 15.225 3.71707 15.8417 4.28374 16.3584C4.8504 16.875 5.50873 17.2917 6.23373 17.575C6.96707 17.8583 7.75039 18 8.54206 18C9.33372 18 10.1087 17.8583 10.8504 17.575C11.5754 17.2917 12.242 16.8834 12.8004 16.3584L17.5254 11.9667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_14463_119014">
        <rect width="20" height="20" fill="white" transform="translate(0 0.5)" />
      </clipPath>
    </defs>
  </svg>
);

export const RetryIcon = () => (
  <svg
    data-testid="retry"
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.6449 6.35C16.1949 4.9 14.2049 4 11.9949 4C7.57488 4 4.00488 7.58 4.00488 12C4.00488 16.42 7.57488 20 11.9949 20C15.7249 20 18.8349 17.45 19.7249 14H17.6449C16.8249 16.33 14.6049 18 11.9949 18C8.68488 18 5.99488 15.31 5.99488 12C5.99488 8.69 8.68488 6 11.9949 6C13.6549 6 15.1349 6.69 16.2149 7.78L12.9949 11H19.9949V4L17.6449 6.35Z"
      fill="currentColor"
    />
  </svg>
);

export const DownloadIcon = () => (
  <svg
    data-testid="download"
    fill="none"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04ZM19 18H6C3.79 18 2 16.21 2 14C2 11.95 3.53 10.24 5.56 10.03L6.63 9.92L7.13 8.97C8.08 7.14 9.94 6 12 6C14.62 6 16.88 7.86 17.39 10.43L17.69 11.93L19.22 12.04C20.78 12.14 22 13.45 22 15C22 16.65 20.65 18 19 18ZM13.45 10H10.55V13H8L12 17L16 13H13.45V10Z"
      fill="currentColor"
    ></path>
  </svg>
);

export const LinkIcon = () => (
  <svg fill="none" height="11" viewBox="0 0 20 11" width="20" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M1.9 5.5C1.9 3.79 3.29 2.4 5 2.4H8.05C8.57467 2.4 9 1.97467 9 1.45C9 0.925329 8.57467 0.5 8.05 0.5H5C2.24 0.5 0 2.74 0 5.5C0 8.26 2.24 10.5 5 10.5H8.05C8.57467 10.5 9 10.0747 9 9.55C9 9.02533 8.57467 8.6 8.05 8.6H5C3.29 8.6 1.9 7.21 1.9 5.5ZM6 5.5C6 6.05228 6.44772 6.5 7 6.5H13C13.5523 6.5 14 6.05228 14 5.5C14 4.94772 13.5523 4.5 13 4.5H7C6.44772 4.5 6 4.94772 6 5.5ZM15 0.5H11.95C11.4253 0.5 11 0.925329 11 1.45C11 1.97467 11.4253 2.4 11.95 2.4H15C16.71 2.4 18.1 3.79 18.1 5.5C18.1 7.21 16.71 8.6 15 8.6H11.95C11.4253 8.6 11 9.02533 11 9.55C11 10.0747 11.4253 10.5 11.95 10.5H15C17.76 10.5 20 8.26 20 5.5C20 2.74 17.76 0.5 15 0.5Z"
      fill="#005DFF"
      fillRule="evenodd"
    />
  </svg>
);

export const BinIcon = () => (
  <svg fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.00033 25.3333C8.00033 26.8 9.20033 28 10.667 28H21.3337C22.8003 28 24.0003 26.8 24.0003 25.3333V12C24.0003 10.5333 22.8003 9.33333 21.3337 9.33333H10.667C9.20033 9.33333 8.00033 10.5333 8.00033 12V25.3333ZM24.0003 5.33333H20.667L19.7203 4.38667C19.4803 4.14667 19.1337 4 18.787 4H13.2137C12.867 4 12.5203 4.14667 12.2803 4.38667L11.3337 5.33333H8.00033C7.26699 5.33333 6.66699 5.93333 6.66699 6.66667C6.66699 7.4 7.26699 8 8.00033 8H24.0003C24.7337 8 25.3337 7.4 25.3337 6.66667C25.3337 5.93333 24.7337 5.33333 24.0003 5.33333Z" />
  </svg>
);

export const CheckSignIcon = () => (
  <svg fill="currentColor" viewBox="0 0 18 14" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.79457 10.875L2.32457 7.40502C1.93457 7.01502 1.30457 7.01502 0.91457 7.40502C0.52457 7.79502 0.52457 8.42502 0.91457 8.81502L5.09457 12.995C5.48457 13.385 6.11457 13.385 6.50457 12.995L17.0846 2.41502C17.4746 2.02502 17.4746 1.39502 17.0846 1.00502C16.6946 0.615024 16.0646 0.615024 15.6746 1.00502L5.79457 10.875Z" />
  </svg>
);
