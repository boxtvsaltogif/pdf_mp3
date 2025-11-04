
import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M7 4V22H9V14H11V22H13V14H15V22H17V4H7ZM15 12H9V6H15V12Z" />
  </svg>
);

export const MaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 4C10.3431 4 9 5.34315 9 7C9 8.65685 10.3431 10 12 10C13.6569 10 15 8.65685 15 7C15 5.34315 13.6569 4 12 4ZM7.5 11C5.567 11 4 12.567 4 14.5V15.5C4 16.0523 4.44772 16.5 5 16.5H19C19.5523 16.5 20 16.0523 20 15.5V14.5C20 12.567 18.433 11 16.5 11H7.5ZM5 17.5V20H19V17.5H5Z" />
  </svg>
);

export const FemaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 4C10.3431 4 9 5.34315 9 7C9 8.65685 10.3431 10 12 10C13.6569 10 15 8.65685 15 7C15 5.34315 13.6569 4 12 4ZM7.5 11C5.567 11 4 12.567 4 14.5V20H6V17H18V20H20V14.5C20 12.567 18.433 11 16.5 11H7.5Z" />
  </svg>
);

export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M13 10H18L12 4L6 10H11V16H13V10ZM4 18H20V20H4V18Z" />
  </svg>
);
