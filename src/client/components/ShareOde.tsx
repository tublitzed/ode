import { useId, useState } from "react";

import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { httpRequest } from "@/client/utils/httpRequest";
import type { Comparison } from "@/shared/ode";

type ShareOdeProps = {
  comparison?: Comparison;
  ode: string;
  topic: string;
};

type ShareResponse = {
  id: string;
};

type View =
  | { link: string; status: "clipboardBlocked" }
  | { link: string; status: "copied" }
  | { message: string; status: "error" }
  | { status: "idle" }
  | { status: "sharing" };

const ShareOde = ({ comparison, ode, topic }: ShareOdeProps) => {
  const [link, setLink] = useState<string>();
  const [view, setView] = useState<View>({ status: "idle" });
  const linkInputId = useId();

  const createLink = async () => {
    const result = await httpRequest<ShareResponse>("/api/shares", {
      body: { comparison, ode, topic },
      method: "POST",
    });

    if (!result.ok && result.status === 401) {
      window.location.assign("/login?next=%2F");
      return undefined;
    }

    if (!result.ok) {
      setView({ message: result.message, status: "error" });
      return undefined;
    }

    const nextLink = `${window.location.origin}/o/${result.data.id}`;
    setLink(nextLink);
    return nextLink;
  };

  const copyLink = async (linkToCopy: string) => {
    try {
      await navigator.clipboard.writeText(linkToCopy);
      setView({ link: linkToCopy, status: "copied" });
    } catch {
      setView({ link: linkToCopy, status: "clipboardBlocked" });
    }
  };

  const share = async () => {
    if (link) {
      await copyLink(link);
      return;
    }

    setView({ status: "sharing" });

    const nextLink = await createLink();
    if (nextLink) {
      await copyLink(nextLink);
    }
  };

  return (
    <div className="grid gap-2">
      <Button
        className="w-full"
        disabled={view.status === "sharing"}
        onClick={share}
        variant="outline"
      >
        {view.status === "sharing" ? "Sharing…" : "Share this ode"}
      </Button>
      <div aria-live="polite">
        {view.status === "copied" && (
          <p className="text-center text-sm text-muted-foreground">
            Link copied
          </p>
        )}
        {view.status === "clipboardBlocked" && (
          <div className="grid gap-2">
            <Label htmlFor={linkInputId}>Copy this link to share</Label>
            <Input
              id={linkInputId}
              onFocus={(event) => event.target.select()}
              readOnly
              value={view.link}
            />
          </div>
        )}
      </div>
      {view.status === "error" && (
        <p className="text-sm text-destructive" role="alert">
          {view.message}
        </p>
      )}
    </div>
  );
};

export default ShareOde;
