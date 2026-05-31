import Link from "next/link";
import {
  ArrowRight,
  FileText,
  ListChecks,
  MessagesSquare,
  Repeat,
} from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const VALUE_CARDS = [
  {
    icon: Repeat,
    title: "Practice before real interviews",
    description:
      "Rehearse your script with a believable participant so the real conversation feels natural.",
  },
  {
    icon: ListChecks,
    title: "Test question quality",
    description:
      "See which questions invite rich answers and which ones fall flat before they matter.",
  },
  {
    icon: FileText,
    title: "Review your transcript",
    description:
      "Every exchange is captured live, so you can reflect and refine your approach.",
  },
];

export default function HomePage() {
  return (
    <>
      <AppHeader mode="MVP" />
      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-5 pt-16 pb-12 sm:px-8 sm:pt-24">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-5 gap-1.5 font-normal">
              <MessagesSquare className="size-3" />
              UX interview rehearsal
            </Badge>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              PersonaPilot
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
              Practice UX interview questions with AI role play participants
              before speaking to real users.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/setup" />}
              >
                Create rehearsal
                <ArrowRight />
              </Button>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {VALUE_CARDS.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader>
                  <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-4.5" />
                  </span>
                  <CardTitle className="pt-2">{title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
