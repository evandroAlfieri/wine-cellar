import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const ResponsiveDialog = ({ open, onOpenChange, children }: ResponsiveDialogProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
};

const ResponsiveDialogTrigger = ({
  children,
  asChild,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerTrigger asChild={asChild}>{children}</DrawerTrigger>;
  }

  return <DialogTrigger asChild={asChild}>{children}</DialogTrigger>;
};

interface ResponsiveDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveDialogContent = ({
  children,
  className,
}: ResponsiveDialogContentProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerContent className={cn("max-h-[90vh]", className)}>
        <div className="overflow-y-auto px-4 pb-6">{children}</div>
      </DrawerContent>
    );
  }

  return (
    <DialogContent className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", className)}>
      {children}
    </DialogContent>
  );
};

interface ResponsiveDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveDialogHeader = ({
  children,
  className,
}: ResponsiveDialogHeaderProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerHeader className={cn("text-left", className)}>{children}</DrawerHeader>;
  }

  return <DialogHeader className={className}>{children}</DialogHeader>;
};

interface ResponsiveDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveDialogTitle = ({
  children,
  className,
}: ResponsiveDialogTitleProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerTitle className={className}>{children}</DrawerTitle>;
  }

  return <DialogTitle className={className}>{children}</DialogTitle>;
};

interface ResponsiveDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const ResponsiveDialogDescription = ({
  children,
  className,
}: ResponsiveDialogDescriptionProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerDescription className={className}>{children}</DrawerDescription>;
  }

  return <DialogDescription className={className}>{children}</DialogDescription>;
};

export {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
};
