
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import VudaLogo from '@/components/dashboard/VudaLogo'; 
import { ShieldCheck, Activity, BrainCircuit } from 'lucide-react';


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header for Landing Page */}
      <header className="py-4 px-6 md:px-10 shadow-md bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <VudaLogo />
          <Link href="/dashboard">
            <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground">
              Access Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="bg-gradient-to-b from-background to-card/50 py-16 md:py-32">
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-teal-300 mb-6">
                    Welcome to VUDA
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                    Imagine every security camera not just recording, but understanding and acting. VUDA is the AI platform transforming passive video feeds into a proactive public safety network.
                </p>
                <Link href="/dashboard">
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transform hover:scale-105 transition-transform duration-300">
                    Launch VUDA Dashboard
                    </Button>
                </Link>
            </div>
        </section>

        {/* Image Section */}
        <section className="py-12 md:py-20 bg-card/50">
          <div className="container mx-auto px-6">
            <div className="relative w-full max-w-5xl mx-auto aspect-[16/8] rounded-xl overflow-hidden shadow-2xl border-2 border-primary/30">
              <Image
                src="https://placehold.co/1200x600.png" 
                alt="VUDA Platform Showcase"
                layout="fill"
                objectFit="cover"
                className="transform hover:scale-105 transition-transform duration-700 ease-out"
                data-ai-hint="city technology future" 
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-background py-16 md:py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">The VUDA Advantage</h2>
            <p className="text-lg text-muted-foreground mb-16 max-w-2xl mx-auto">
              VUDA leverages cutting-edge Video Understanding and Descriptive Analytics to detect threats in real-time, initiating automated, life-saving responses.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="p-8 rounded-xl border border-border bg-card shadow-xl hover:shadow-primary/20 transition-shadow duration-300 transform hover:-translate-y-2">
                <div className="flex justify-center mb-4">
                    <ShieldCheck className="h-12 w-12 text-primary"/>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-primary">Real-Time Threat Detection</h3>
                <p className="text-muted-foreground">VUDA continuously analyzes video feeds, identifying a comprehensive range of threats—from violent crimes and medical emergencies to public safety incidents and infrastructure anomalies.</p>
              </div>
              <div className="p-8 rounded-xl border border-border bg-card shadow-xl hover:shadow-primary/20 transition-shadow duration-300 transform hover:-translate-y-2">
                <div className="flex justify-center mb-4">
                    <Activity className="h-12 w-12 text-primary"/>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-primary">Automated Intelligent Response</h3>
                <p className="text-muted-foreground">Beyond alerts, VUDA analyzes incident context to automatically dispatch first responders, coordinate actions, and ensure rapid, informed interventions.</p>
              </div>
              <div className="p-8 rounded-xl border border-border bg-card shadow-xl hover:shadow-primary/20 transition-shadow duration-300 transform hover:-translate-y-2">
                <div className="flex justify-center mb-4">
                    <BrainCircuit className="h-12 w-12 text-primary"/>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-primary">AI-Synthesized Reporting</h3>
                <p className="text-muted-foreground">Delivers concise, AI-generated incident reports and actionable insights directly to emergency services, enhancing situational awareness and decision-making.</p>
              </div>
            </div>
            <p className="text-xl text-primary mt-16 font-semibold">
              VUDA is poised to redefine urban safety. Our platform is designed to help cities achieve an average 70% reduction in emergency response times and a 50% decrease in false alarms. The future of safety isn’t just watching—it’s understanding.
            </p>
          </div>
        </section>

         {/* "Developed By" Section */}
        <section className="py-12 md:py-20 bg-card/50">
            <div className="container mx-auto px-6 text-center">
                <p className="text-lg text-muted-foreground mb-2">Pioneering the Future of Public Safety</p>
                <h3 className="text-2xl md:text-3xl font-semibold text-foreground">
                Developed by <span className="text-primary">SocioDynamics AI</span>
                </h3>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 text-center border-t border-border bg-card">
        <p className="text-muted-foreground">
          &copy; {new Date().getFullYear()} VUDA Platform by SocioDynamics AI. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
