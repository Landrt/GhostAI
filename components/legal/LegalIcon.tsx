import React from "react";
import {
  Building,
  FileText,
  Shield,
  Cookie,
  BadgePercent,
  Wallet,
  Bot,
  FileSignature,
  Scale,
  FolderLock,
  LucideProps,
} from "lucide-react";

interface LegalIconProps extends LucideProps {
  name: string;
}

export function LegalIcon({ name, ...props }: LegalIconProps) {
  switch (name) {
    case "Building":
      return <Building {...props} />;
    case "FileText":
      return <FileText {...props} />;
    case "Shield":
      return <Shield {...props} />;
    case "Cookie":
      return <Cookie {...props} />;
    case "BadgePercent":
      return <BadgePercent {...props} />;
    case "Wallet":
      return <Wallet {...props} />;
    case "Bot":
      return <Bot {...props} />;
    case "FileSignature":
      return <FileSignature {...props} />;
    case "Scale":
      return <Scale {...props} />;
    default:
      return <FolderLock {...props} />;
  }
}
