import { Button } from "./components/ui/button";

const prank = () => {
  window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
};

function App() {
  return (
    <>
      <div className="flex w-full h-screen space-y-10 flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Tailwind is superior</h1>
        <Button onClick={prank}>Click here</Button>
      </div>
    </>
  );
}

export default App;
