import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="mx-auto p-4 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-6xl">
      <Navbar />
      <div className="flex items-center justify-center mt-4">
        <SignUp />
      </div>
      <Footer />
    </div>
  );
}
