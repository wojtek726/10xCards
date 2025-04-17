interface InlineErrorProps {
  message: string;
}

export const InlineError = ({ message }: InlineErrorProps) => {
  return (
    <div role="alert" className="text-sm text-destructive">
      {message}
    </div>
  );
};
