import { SignIn } from "@clerk/nextjs";

export default function SignInAdmin() {
  return (
    <div className="h-screen my-auto flex items-center justify-center mt-4 place-content-center">
      <SignIn />
    </div>
  );
}
