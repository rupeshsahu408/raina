import { RecruitAuthProvider } from "@/contexts/RecruitAuthContext";

export default function RecruitLayout({ children }: { children: React.ReactNode }) {
  return <RecruitAuthProvider>{children}</RecruitAuthProvider>;
}
