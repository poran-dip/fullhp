import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface TeamMember {
  name: string;
  role: string;
  college: string;
  image: string;
  linkedin: string;
  github: string;
}

const currentTeam: TeamMember[] = [
  {
    name: "Poran Dip Boruah",
    role: "Co-Founder · Full-Stack & Systems",
    college: "Assam Engineering College",
    image: "/poran.jpg",
    linkedin: "https://www.linkedin.com/in/poran-dip/",
    github: "https://github.com/poran-dip",
  },
  {
    name: "Dikshyan Chakraborty",
    role: "Co-Founder · Full-Stack",
    college: "Assam Down Town University",
    image: "/dikshayn.jpeg",
    linkedin: "https://www.linkedin.com/in/dikshyan-chakraborty-27a1741b4/",
    github: "https://github.com/Dikshyan",
  },
];

const techStack = [
  { name: "Next.js", link: "https://nextjs.org/" },
  { name: "React", link: "https://react.dev/" },
  { name: "TypeScript", link: "https://www.typescriptlang.org/" },
  { name: "Tailwind CSS", link: "https://tailwindcss.com/" },
  { name: "shadcn", link: "https://ui.shadcn.com/" },
  { name: "Prisma", link: "https://www.prisma.io/" },
  { name: "PostgreSQL", link: "https://www.postgresql.org/" },
  { name: "Supabase", link: "https://supabase.com/" },
  { name: "Auth.js", link: "https://authjs.dev/" },
  { name: "Google Gemini", link: "https://gemini.google.com/" },
  { name: "Motion", link: "https://motion.dev/" },
  { name: "Zod", link: "https://zod.dev/" },
  { name: "pnpm", link: "https://pnpm.io/" },
  { name: "Biome", link: "https://biomejs.dev/" },
  { name: "Docker", link: "https://www.docker.com/" },
];

export default function AboutPage() {
  return (
    <main className="flex-1 container mx-auto px-4 pt-12 pb-20 max-w-4xl">
      {/* Origin Story */}
      <section className="mb-16">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-10">
          Our Story
        </h1>
        <div className="max-w-2xl mx-auto space-y-5 text-muted-foreground leading-relaxed">
          <p>
            FullHP didn&apos;t start with a grand plan — it started with
            Dikshayn convincing <span className="italic">(read: nagging)</span>{" "}
            me to join yet another hackathon. Once we were in, we teamed up with
            Rajdeep and Hirok to build something real: a healthcare platform
            that connects patients, doctors, and hospitals, making medical
            access simpler than it has any right to be.
          </p>
          <p>
            With Dikshayn leading the AI-powered medbot and me handling the
            backend and architecture, we pushed ourselves further than anything
            we&apos;d built before. Every late night, every refactor, and every
            bug that only appeared in production brought us here.
          </p>
          <p>
            What started as EazyDoc at a hackathon is now FullHP — rebuilt from
            the ground up, properly architected, and being developed into
            something that can actually be used. It&apos;s a step toward
            accessible, full-stack healthcare management, and we&apos;re just
            getting started.
          </p>
          <p className="text-right pt-2 text-foreground font-medium">
            ~Poran Dip
          </p>
        </div>
      </section>

      <Separator className="my-12" />

      {/* Current Team */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          The Team
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {currentTeam.map((member) => (
            <Card
              key={member.name}
              className="flex items-center gap-5 p-6 group hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="shrink-0">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={80}
                  height={80}
                  className="rounded-full border border-border object-cover w-20 h-20 group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-lg leading-tight">
                  {member.name}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {member.role}
                </p>
                <p className="text-xs text-muted-foreground italic mt-0.5 mb-3">
                  {member.college}
                </p>
                <div className="flex gap-3">
                  <Link
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                  >
                    <div className="relative w-7 h-7">
                      <Image
                        src="/icons/github.svg"
                        alt="GitHub"
                        fill
                        className="opacity-50 hover:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </Link>
                  <Link
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-110 transition-transform"
                  >
                    <div className="relative w-7 h-7">
                      <Image
                        src="/icons/linkedin.svg"
                        alt="LinkedIn"
                        fill
                        className="opacity-50 hover:opacity-100 transition-opacity duration-200"
                      />
                    </div>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* OG Team mention */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Originally built alongside{" "}
          <Link
            href="https://www.linkedin.com/in/rajdeep-choudhury-5152a4309/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
            Rajdeep Choudhury
          </Link>{" "}
          and{" "}
          <Link
            href="https://www.linkedin.com/in/hirak-jyoti-sarma-06604a267"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
            Hirok Jyoti Sarma
          </Link>{" "}
          as part of Cosmic Titans.
        </p>
      </section>

      <Separator className="my-12" />

      {/* Tech Stack */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Built With
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {techStack.map((tech) => (
            <Link
              key={tech.name}
              href={tech.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-100 hover:bg-gray-200 px-2.5 sm:px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150"
            >
              {tech.name}
            </Link>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* Contact */}
      <section className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Get in Touch</h2>
        <p className="text-muted-foreground">
          Questions, feedback, or just want to say hi —{" "}
          <Link
            href="mailto:hello@poran.dev"
            className="text-foreground underline underline-offset-2 hover:no-underline"
          >
            hello@poran.dev
          </Link>
        </p>
      </section>
    </main>
  );
}
