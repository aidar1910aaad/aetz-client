// components/layout/sidebarLinks.ts
export const sidebarLinks = [
    {
      type: "group",
      label: "Основные модули",
      icon: "/sidebarIcons/modules.png",
      submenu: [
        { label: "Трансформатор", href: "/dashboard/module1" },
        { label: "Среднее напряжение", href: "/dashboard/module2" },
        { label: "Низкое напряжение", href: "/dashboard/module2" },
        { label: "БМЗ", href: "/dashboard/module2" },
        { label: "Доп. оборудование", href: "/dashboard/module2" },
      ],
    },
    {
      type: "link",
      label: "Форма заявки",
      icon: "/sidebarIcons/reqForm.png",
      href: "/dashboard/form",
    },
    {
      type: "link",
      label: "Чек лист",
      icon: "/sidebarIcons/checklist.png",
      href: "/dashboard/checklist",
    },
    {
      type: "link",
      label: "История заявок",
      icon: "/sidebarIcons/historySide.png",
      href: "/dashboard/requests",
    },
    {
      type: "link",
      label: "Новая заявка",
      icon: "/sidebarIcons/newreq.png",
      href: "/dashboard/new",
    },
  ];
  