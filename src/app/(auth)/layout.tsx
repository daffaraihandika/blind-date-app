import React from "react";
import MobileContainer from "@/components/layout/MobileContainer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MobileContainer>{children}</MobileContainer>;
}
