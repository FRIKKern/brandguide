
import Link from "next/link";

import { BreadcrumbLink as BreadcrumbLinkType } from "@/types";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./breadcrumb";

const BreadcrumbCustomItem = ({
  label,
  href,
  isCurrent,
}: BreadcrumbLinkType & { isCurrent?: boolean }) => {
  return (
    <>
      <BreadcrumbItem className="font-bold text-primary">
        {!isCurrent ? (
          <BreadcrumbLink className="hover:text-primary/70" asChild>
            <Link href={href}>{label}</Link>
          </BreadcrumbLink>
        ) : (
          <BreadcrumbPage>{label}</BreadcrumbPage>
        )}
      </BreadcrumbItem>
      {!isCurrent && <BreadcrumbSeparator className="text-primary" />}
    </>
  );
};

export default function Breadcrumbs({
  links,
}: {
  links: BreadcrumbLinkType[];
}) {
  return (
    <Breadcrumb className="mb-3 lg:mb-6">
      <BreadcrumbList>
        {links.map((link, index) => (
          <BreadcrumbCustomItem
            key={link.label}
            {...link}
            isCurrent={index === links.length - 1}
          />
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
