import { Check } from "lucide-react";
import { useId, useState } from "react";
import type { VariantProps } from "class-variance-authority";

import { Button } from "@/client/components/ui/button";
import type { buttonVariants } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { httpRequest } from "@/client/utils/httpRequest";
import { loadShareId, saveShareId } from "@/client/utils/localStorage";
import type { Comparison, MosaicShape } from "@/shared/ode";

type ShareOdeProps = {
  comparison?: Comparison;
  disabled?: boolean;
  forceView?: View; // Storybook only
  mosaic?: MosaicShape[];
  ode: string;
  size?: VariantProps<typeof buttonVariants>["size"];
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

const renderLabel = (view: View) => {
  if (view.status === "sharing") {
    return "Sharing…";
  }

  if (view.status === "copied") {
    return (
      <>
        <Check aria-hidden="true" />
        Link copied
      </>
    );
  }

  return "Share this ode";
};

const toLink = (id: string) => `${window.location.origin}/o/${id}`;

const ShareOde = ({
  comparison,
  disabled = false,
  forceView,
  mosaic,
  ode,
  size,
  topic,
}: ShareOdeProps) => {
  const [shareId, setShareId] = useState(() => loadShareId(comparison));
  const [view, setView] = useState<View>(forceView ?? { status: "idle" });
  const linkInputId = useId();

  const createShare = async () => {
    const result = await httpRequest<ShareResponse>("/api/shares", {
      body: { comparison, mosaic, ode, topic },
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

    saveShareId(comparison, result.data.id);
    setShareId(result.data.id);
    return result.data.id;
  };

  const copyLink = async (id: string) => {
    const link = toLink(id);

    try {
      await navigator.clipboard.writeText(link);
      setView({ link, status: "copied" });
    } catch {
      setView({ link, status: "clipboardBlocked" });
    }
  };

  const share = async () => {
    if (shareId) {
      await copyLink(shareId);
      return;
    }

    setView({ status: "sharing" });

    const nextShareId = await createShare();
    if (nextShareId) {
      await copyLink(nextShareId);
    }
  };

  return (
    <div className="grid gap-2">
      <Button
        className="w-full"
        disabled={disabled || view.status === "sharing"}
        onClick={share}
        size={size}
        variant="outline"
      >
        {renderLabel(view)}
      </Button>
      <span aria-live="polite" className="sr-only">
        {view.status === "copied" ? "Link copied" : ""}
      </span>
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
      {view.status === "error" && (
        <p className="text-sm text-destructive" role="alert">
          {view.message}
        </p>
      )}
    </div>
  );
};

export default ShareOde;
