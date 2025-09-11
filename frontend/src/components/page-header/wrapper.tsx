function PageHeader({ children }: any) {
  return (
    <div className="flex flex-col-reverse sm:flex-row justify-between items-start gap-5">
      {children}
    </div>
  );
}
export default PageHeader;
