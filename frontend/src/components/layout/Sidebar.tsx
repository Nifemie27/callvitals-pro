import { SidebarContent } from "@/components/layout/SidebarContent";

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-svh w-[232px] shrink-0 print:hidden lg:flex">
      <SidebarContent />
    </aside>
  );
}
