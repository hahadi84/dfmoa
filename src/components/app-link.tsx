import NextLink, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

type AppLinkProps = PropsWithChildren<
  LinkProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>
>;

export default function Link({ children, ...props }: AppLinkProps) {
  return (
    <NextLink prefetch={false} {...props}>
      {children}
    </NextLink>
  );
}
