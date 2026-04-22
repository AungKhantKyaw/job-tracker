import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register", 
  description: "Create a new account on OfferGrid",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}