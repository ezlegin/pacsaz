const PageTitle = ({
  subTitle,
  title,
}: {
  title: string;
  subTitle: string;
}) => {
  return (
    <div className="text-center space-y-1">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground max-w-lg mx-auto">
        {subTitle}
      </p>
    </div>
  );
};

export default PageTitle;
