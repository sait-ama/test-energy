export const LoadingAppIndicator = (props: { className?: string }) => {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <div className="border-primary absolute h-12 w-12 animate-ping rounded-full border-4 opacity-75"></div>
      {/* <div className="border-primary absolute h-16 w-16 animate-spin rounded-full border-4 border-t-transparent"></div> */}
      <div
        className="border-primary/50 absolute h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"
        style={{ animationDuration: '1.5s' }}
      ></div>
      <div
        className="border-primary/30 absolute h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
        style={{ animationDuration: '2s' }}
      ></div>
    </div>
  );
};

export default LoadingAppIndicator;
