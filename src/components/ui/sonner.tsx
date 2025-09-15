import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      expand={true}
      richColors={false}
      closeButton={true}
      duration={4500}
      gap={12}
      offset={20}
      toastOptions={{
        style: {
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          padding: '20px 24px',
          fontSize: '15px',
          fontWeight: '500',
          minHeight: '70px',
          width: '420px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          lineHeight: '1.5',
          left: '50%',
          transform: 'translateX(-50%)',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
