export default function LoadingSpinner({ size = "default", className = "" }) {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-8 w-8", 
    large: "h-12 w-12"
  };

  return (
    <div className={`flex items-center justify-center h-[50vh] ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-green-500 ${sizeClasses[size]}`}></div>
    </div>
  );
}
