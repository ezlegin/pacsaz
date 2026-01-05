const HomeTitle = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  return (
    <div className="space-y-2 text-center">
      <h2 className="font-semibold text-2xl">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default HomeTitle;
