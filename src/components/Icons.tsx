import { memo, forwardRef, SVGProps } from 'react';
import { IconBase } from '@/components/ui/IconBase';
import { cn } from '@/lib/utils';

export function Logomark({ className = "", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      className={cn("logomark darkmode", className)}
      width="100%"
      height="100%"
      viewBox="0 0 189 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="false"
      aria-label="Plebs logo"
      {...props}
    >
      <g stroke="#fff" strokeWidth="12" strokeLinejoin="round">
        <path d="M115.446 94.3634V251H5V94.3634C5 45.0429 45.0416 5 94.3621 5C143.683 5 183.726 45.0429 183.726 94.3634V182.72H73.2796V94.3634C73.2796 82.7266 82.7266 73.2796 94.3621 73.2796C105.999 73.2796 115.446 82.7266 115.446 94.3634Z" />
        <path d="M149.585 94.3629V216.859H39.1392V94.3629C39.1392 63.8847 63.8834 39.1396 94.3617 39.1396C124.84 39.1396 149.585 63.8847 149.585 94.3629Z" />
      </g>
    </svg>
  )
};

export const ChevronRight = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="Chevron right icon" {...props}>
    <path d="m9 18 6-6-6-6" />
  </IconBase>
)));

export const Plus = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="Plus icon" {...props}>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </IconBase>
)));

export const Minus = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="Minus icon" {...props}>
    <path d="M5 12h14" />
  </IconBase>
)));

export const User = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="User icon" {...props}>
    <circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" />
  </IconBase>
)));

export const More = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="More icon" {...props}>
    <line x1="4" x2="20" y1="9" y2="9" />
    <line x1="4" x2="14" y1="16" y2="16" />
  </IconBase>
)));

export const Brain = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="Brain icon" {...props}>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
    <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
    <path d="M6 18a4 4 0 0 1-1.967-.516" />
    <path d="M19.967 17.484A4 4 0 0 1 18 18" />
  </IconBase>
)));

export const Dot = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="Dot icon" {...props}>
    <circle cx="12.1" cy="12.1" r="1" />
  </IconBase>
)));

export const Cross = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="Cross icon" {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </IconBase>
)));

export const Shrink = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="Shrink icon" {...props}>
    <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
    <path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
    <path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
    <path d="M9 4.2V9m0 0H4.2M9 9 3 3" />
  </IconBase>
)));

export const Minimize = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="Minimize icon" {...props}>
    <path d="m14 10 7-7" />
    <path d="M20 10h-6V4" />
    <path d="m3 21 7-7" />
    <path d="M4 14h6v6" />
  </IconBase>
)));

export const X = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="X logo icon" fill="currentColor" stroke="none" {...props}>
    <path d="M14.2833 10.1624L23.2178 0H21.1006L13.3427 8.82384L7.14656 0H0L9.36984 13.3432L0 24H2.11732L10.3098 14.6817L16.8534 24H24L14.2827 10.1624H14.2833ZM11.3833 13.4608L10.4339 12.1321L2.88022 1.55962H6.1323L12.2282 10.0919L13.1776 11.4206L21.1016 22.5113H17.8495L11.3833 13.4613V13.4608Z" />
  </IconBase>
)));

export const Discord = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="Discord logo icon" fill="currentColor" stroke="none" {...props}>
    <path d="M15.3785 0C15.144 0.416155 14.9334 0.846667 14.742 1.28674C12.9232 1.01409 11.0709 1.01409 9.24729 1.28674C9.06063 0.846667 8.84523 0.416155 8.61072 0C6.902 0.291799 5.23636 0.803618 3.65689 1.52591C0.526643 6.16106 -0.320532 10.6766 0.100668 15.13C1.93381 16.4837 3.98715 17.5169 6.17448 18.177C6.66747 17.5169 7.10303 16.8138 7.47636 16.0819C6.76798 15.8188 6.08354 15.4888 5.42782 15.1061C5.60012 14.9817 5.76765 14.8526 5.93038 14.7282C9.77378 16.5363 14.2251 16.5363 18.0732 14.7282C18.236 14.8621 18.4035 14.9913 18.5758 15.1061C17.9201 15.4935 17.2356 15.8188 16.5225 16.0867C16.8958 16.8185 17.3313 17.5217 17.8244 18.1818C20.0116 17.5217 22.0649 16.4933 23.8982 15.1396C24.3959 9.97345 23.0462 5.49616 20.3323 1.5307C18.7577 0.808409 17.092 0.296572 15.3833 0.0095644L15.3785 0ZM8.01242 12.3891C6.83022 12.3891 5.84902 11.3176 5.84902 9.9926C5.84902 8.6676 6.79192 7.59131 8.00765 7.59131C9.22338 7.59131 10.1902 8.67237 10.171 9.9926C10.1519 11.3128 9.21858 12.3891 8.01242 12.3891ZM15.9864 12.3891C14.7994 12.3891 13.8278 11.3176 13.8278 9.9926C13.8278 8.6676 14.7707 7.59131 15.9864 7.59131C17.2021 7.59131 18.1642 8.67237 18.145 9.9926C18.1259 11.3128 17.1926 12.3891 15.9864 12.3891Z" />
  </IconBase>
)));

export const Github = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="Github logo icon" fill="currentColor" stroke="none" {...props}>
    <path d="M12.0099 0C5.36875 0 0 5.40833 0 12.0992C0 17.4475 3.43994 21.9748 8.21205 23.5771C8.80869 23.6976 9.02724 23.3168 9.02724 22.9965C9.02724 22.716 9.00757 21.7545 9.00757 20.7527C5.6667 21.474 4.97099 19.3104 4.97099 19.3104C4.43409 17.9082 3.63858 17.5478 3.63858 17.5478C2.54511 16.8066 3.71823 16.8066 3.71823 16.8066C4.93117 16.8868 5.56763 18.0486 5.56763 18.0486C6.64118 19.8913 8.37111 19.3707 9.06706 19.0501C9.16638 18.2688 9.48473 17.728 9.82275 17.4276C7.15817 17.1471 4.35469 16.1055 4.35469 11.458C4.35469 10.1359 4.8316 9.05428 5.58729 8.21304C5.46807 7.91263 5.0504 6.67043 5.70677 5.00787C5.70677 5.00787 6.72083 4.6873 9.00732 6.24981C9.98625 5.98497 10.9958 5.85024 12.0099 5.84911C13.024 5.84911 14.0577 5.98948 15.0123 6.24981C17.299 4.6873 18.3131 5.00787 18.3131 5.00787C18.9695 6.67043 18.5515 7.91263 18.4323 8.21304C19.2079 9.05428 19.6652 10.1359 19.6652 11.458C19.6652 16.1055 16.8617 17.1269 14.1772 17.4276C14.6148 17.8081 14.9924 18.5292 14.9924 19.6711C14.9924 21.2936 14.9727 22.5957 14.9727 22.9962C14.9727 23.3168 15.1915 23.6976 15.7879 23.5774C20.56 21.9745 23.9999 17.4475 23.9999 12.0992C24.0196 5.40833 18.6312 0 12.0099 0Z" />
  </IconBase>
)));

export const ChevronLeft = memo(forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <IconBase ref={ref} aria-label="Chevron left icon" {...props}>
    <path d="m15 18-6-6 6-6" />
  </IconBase >
)));
