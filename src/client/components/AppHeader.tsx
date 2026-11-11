import { cn } from "cn";

import { Button } from "@/client/components/ui/button";

const NAV_LINK_CLASS = "min-h-0 px-0 py-1 text-sm";
const CURRENT_NAV_LINK_CLASS = "text-foreground";
const OTHER_NAV_LINK_CLASS =
  "text-muted-foreground no-underline hover:text-foreground hover:underline";

type AppHeaderProps = {
  currentPath?: string;
};

const logOut = async () => {
  try {
    await fetch("/api/logout", { method: "POST" });
  } finally {
    window.location.assign("/login");
  }
};

const AppHeader = ({ currentPath }: AppHeaderProps) => {
  const isAbout = currentPath === "/about";

  return (
    <header className="flex items-center justify-between px-4 py-5 md:px-12 md:py-7">
      <a
        className="font-display flex items-center gap-2.5 rounded-sm text-2xl focus-visible:outline-2 focus-visible:outline-offset-4"
        href="/"
      >
        <img
          alt=""
          className="size-7"
          height={28}
          src="/favicon.svg"
          width={28}
        />
        Ode
      </a>
      <nav aria-label="Account" className="flex items-center gap-6">
        <Button
          asChild
          className={cn(
            NAV_LINK_CLASS,
            isAbout ? CURRENT_NAV_LINK_CLASS : OTHER_NAV_LINK_CLASS,
          )}
          variant="link"
        >
          <a aria-current={isAbout ? "page" : undefined} href="/about">
            About
          </a>
        </Button>
        <Button
          className={cn(NAV_LINK_CLASS, OTHER_NAV_LINK_CLASS)}
          onClick={logOut}
          variant="link"
        >
          Log out
        </Button>
      </nav>
    </header>
  );
};

export default AppHeader;
