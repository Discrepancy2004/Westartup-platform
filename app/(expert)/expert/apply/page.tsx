import Link from "next/link";
import { ExpertApplyForm } from "@/components/expert/expert-apply-form";

export default function ExpertApplyPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-8 font-display text-lg text-ink">
        WeStartup
      </Link>
      <ExpertApplyForm />
    </div>
  );
}
