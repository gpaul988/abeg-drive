export const customerNavLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/book", label: "Book a driver" },
  { href: "/trip-history", label: "Trip history" },
  { href: "/profile", label: "Profile" },
  { href: "/payment-methods", label: "Payment" },
  { href: "/support", label: "Support" },
];

export const driverNavLinks = [
  { href: "/driver/dashboard", label: "Dashboard" },
  { href: "/driver/earnings", label: "Earnings" },
  { href: "/driver/ratings", label: "Ratings" },
  { href: "/driver/documents", label: "Documents" },
  { href: "/driver/training", label: "Training" },
];

export const adminNavLinks = [
  { href: "/admin/dashboard", label: "Overview" },
  { href: "/admin/verifications", label: "Verifications" },
  { href: "/admin/drivers", label: "Drivers" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/trips", label: "Trips" },
  { href: "/admin/incidents", label: "Incidents" },
  { href: "/admin/bond-fund", label: "Bond fund" },
  { href: "/admin/pricing", label: "Pricing" },
  { href: "/admin/venues", label: "Venues" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/audit-log", label: "Audit log" },
];

export function getAdminNavLinks(role: string) {
  // Audit log is Super Admin only — see lib comment in
  // app/api/v1/admin/audit-log/route.ts for the rationale.
  return role === "super_admin" ? adminNavLinks : adminNavLinks.filter((l) => l.href !== "/admin/audit-log");
}

export const securityNavLinks = [
  { href: "/security/dashboard", label: "Live map" },
  { href: "/security/incidents", label: "Incidents" },
];
