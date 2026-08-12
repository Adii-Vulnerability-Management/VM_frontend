const PageModuleHeader = ({ title, subtitle }) => (
  <header className="rounded-2xl bg-[#2B245C] px-6 py-8 shadow-lg">
    <h1 className="text-3xl font-bold text-cyan-50">{title}</h1>
    {subtitle && (
      <p className="mt-1 text-sm font-semibold text-white">{subtitle}</p>
    )}
  </header>
);

export default PageModuleHeader;
