import { Spinner } from "@/components/ui/shadcn-io/spinner";

export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Spinner
          variant="ring"
          className="h-12 w-12 animate-spin text-primary"
        />
        <p className="text-lg text-muted-foreground animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
