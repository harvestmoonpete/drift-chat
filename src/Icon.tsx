export type IconName =
  | "rooms"
  | "compass"
  | "message"
  | "plus"
  | "search"
  | "send"
  | "chevron"
  | "close"
  | "copy"
  | "users"
  | "shuffle"
  | "smile"
  | "check"
  | "menu"
  | "info"
  | "arrow"
  | "reset";
const paths: Record<IconName, React.ReactNode> = {
  rooms: (
    <>
      <path d="M4 8h16M4 16h16M9 3 7 21M17 3l-2 18" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.5 5.5L8 16l2.5-5.5z" />
    </>
  ),
  message: (
    <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.8-4A8.5 8.5 0 1 1 21 11.5Z" />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  send: (
    <>
      <path d="m4 4 17 8-17 8 3-8zM7 12h14" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="13" rx="2" />
      <path d="M16 8V3H3v13h5" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v2" />
    </>
  ),
  shuffle: (
    <>
      <path d="M3 6h3c5 0 6 12 11 12h4M3 18h3c2 0 3-2 4-4m4-4c1-2 2-4 4-4h3M18 3l3 3-3 3m0 6 3 3-3 3" />
    </>
  ),
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14c1.5 3 6.5 3 8 0M8 8h.01M16 8h.01" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7h.01" />
    </>
  ),
  arrow: <path d="m13 5 7 7-7 7M4 12h16" />,
  reset: (
    <>
      <path d="M3 10a9 9 0 1 1 1.7 7M3 4v6h6" />
    </>
  ),
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
