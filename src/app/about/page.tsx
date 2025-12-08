import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

interface TeamMember {
  name: string;
  role: string;
  college: string;
  contact: string;
  image: string;
  linkedin: string;
  github: string;
  bio: string;
}

interface TechStack {
  name: string;
  link: string;
}

export default function AboutUsPage() {
  const teamMembers: TeamMember[] = [
    {
      name: 'Dikshyan Chakroborty',
      role: 'AI & Frontend Dev',
      college: 'Assam Down Town University',
      contact: '#',
      image: '/dikshayn.jpeg',
      linkedin: 'https://www.linkedin.com/in/dikshyan-chakraborty-27a1741b4/',
      github: 'https://github.com/Dikshyan',
      bio: 'Code wizard turning AI dreams into pixel-perfect realities. Turning coffee into complex algorithms.'
    },
    {
      name: 'Poran Dip Boruah',
      role: 'Backend & System Architect',
      college: 'Assam Engineering College',
      contact: 'porandip4@gmail.com',
      image: '/poran.jpg',
      linkedin: 'https://www.linkedin.com/in/poran-dip/',
      github: 'https://github.com/poran-dip',
      bio: 'Backend maestro who makes servers sing and databases dance. Solving complex problems with elegant solutions.'
    },
    {
      name: 'Rajdeep Choudhury',
      role: 'Presentation & Project Coordination',
      college: 'Amity University',
      contact: '#',
      image: '/rajdeep.jpeg',
      linkedin: 'https://www.linkedin.com/in/rajdeep-choudhury-5152a4309',
      github: 'https://github.com/RajdeepChoudhury',
      bio: 'Presentation ninja and coordination guru. Transforms technical chaos into smooth, understandable narratives.'
    },
    {
      name: 'Hirok Jyoti Sarma',
      role: 'Research & Data Analyst',
      college: 'Assam Down Town University',
      contact: '#',
      image: '/hirok.jpeg',
      linkedin: 'https://www.linkedin.com/in/hirak-jyoti-sarma-06604a267',
      github: '#',
      bio: 'Data detective digging deep into insights. Transforms raw numbers into meaningful stories.'
    }
  ];

  const techStack: TechStack[] = [
    { name: 'Next.js', link: 'https://nextjs.org/' },
    { name: 'React', link: 'https://react.dev/' },
    { name: 'TypeScript', link: 'https://www.typescriptlang.org/' },
    { name: 'Tailwind CSS', link: 'https://tailwindcss.com/' },
    { name: 'Shadcn UI', link: 'https://ui.shadcn.com/' },
    { name: 'Lucide React', link: 'https://lucide.dev/' },
    { name: 'Prisma', link: 'https://www.prisma.io/' },
    { name: 'Google Gemini', link: 'https://gemini.google.com/' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
        {/* Journey Section */}
        <section className="mb-16 px-4">
          <h1 className="text-4xl font-bold text-center mb-6">Our Journey</h1>
          <div className="max-w-2xl mx-auto space-y-6 text-center text-muted-foreground">
            <p>
              Eazydoc didn&apos;t start with a grand plan—it started with Dikshayn convincing <span className="italic">(read: nagging)</span> me to join 
              yet another hackathon. Once we were in, we teamed up with Rajdeep and Hirok to build something real:
              a seamless healthcare platform that connects patients, doctors, and hospitals with ease, making medical access simpler than ever.
            </p>
            <p>
              With Dikshayn leading the AI-driven medbot and me handling most of the backend, we pushed
              ourselves beyond what we&apos;d ever built before. Every late night, every refactor, and every unexpected 
              bug brought us here—turning what started as a hackathon project into something we&apos;re truly proud of.
            </p>
            <p>
              Eazydoc isn&apos;t just an idea anymore. It&apos;s a step toward accessible, AI-powered healthcare.
            </p>
            <p className="text-right mt-6">~Poran Dip</p>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Team: Cosmic Titans</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <Card key={index} className="flex items-center p-6 group hover:bg-gray-50 transition-colors duration-300">
                <div className="shrink-0 mr-6">
                <Image 
                  src={member.image} 
                  alt={member.name} 
                  width={96} // set an explicit width
                  height={96} // set an explicit height
                  className="w-24 h-24 rounded-full border-2 border-primary shadow-sm 
                            transform group-hover:scale-115 transition-transform duration-300"
                  priority // optional, use for images above the fold
                />
                </div>
                <div className="grow">
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-muted-foreground mb-1">{member.role}</p>
                  <p className="text-sm text-muted-foreground italic mb-3">{member.college}</p>
                  <p className="text-sm text-muted-foreground mb-4">{member.bio}</p>
                  <div className="flex justify-start space-x-4">
                    {member.contact !== '#' && (
                      <Link
                        href={`mailto:${member.contact}`}
                        className="text-muted-foreground hover:text-primary hover:scale-110 transition-all"
                      >
                        <div className="relative w-8 h-8">
                          <Image
                            src="/icons/gmail.svg"
                            alt="gmail"
                            fill
                            className="opacity-50 hover:opacity-100 transition-opacity duration-300"
                          />
                        </div>
                      </Link>
                    )}
                    {member.github !== '#' && (
                      <Link
                        href={member.github}
                        className="text-muted-foreground hover:text-primary hover:scale-110 transition-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="relative w-8 h-8">
                          <Image
                            src="/icons/github.svg"
                            alt="github"
                            fill
                            className="opacity-50 hover:opacity-100 transition-opacity duration-300"
                          />
                        </div>
                      </Link>
                    )}
                    {member.linkedin !== '#' && (
                      <Link
                        href={member.linkedin}
                        className="text-muted-foreground hover:text-primary hover:scale-110 transition-all"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="relative w-8 h-8">
                          <Image
                            src="/icons/linkedin.svg"
                            alt="linkedin"
                            fill
                            className="opacity-50 hover:opacity-100 transition-opacity duration-300"
                          />
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Our Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech, index) => (
              <Link
                key={index}
                href={tech.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium
                         transition-all duration-150 hover:bg-gray-200 hover:scale-105"
              >
                {tech.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
          <div className="text-center">
            <p className="text-muted-foreground">
              <span className="font-semibold">Email: </span>
              <Link
                href="mailto:support.eazydoc@gmail.com"
                className="underline hover:no-underline"
              >
                support.eazydoc@gmail.com
              </Link>
            </p>
            <p className="text-muted-foreground">
              <span className="font-semibold">Address:</span> Guwahati, Assam, IN - 781034
            </p>
            <p className="text-muted-foreground mt-4">
              Stay tuned! More features dropping soon!
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}