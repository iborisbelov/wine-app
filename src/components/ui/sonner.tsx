import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      toastOptions={{
        style: {
          background: '#F7F5F4',
          color: '#1A1A1A',
          border: '1px solid rgba(26, 26, 26, 0.1)',
          borderRadius: '16px',
          padding: '12px 16px',
          fontSize: '14px',
          fontFamily: 'Inter, -apple-system, sans-serif',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
        className: 'wine-toast',
      }}
      {...props}
    />
  );
};

export { Toaster };