"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo on the Left */}
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">SecureVault</span>
          </Link>

          {/* Login and Sign Up on the Right */}
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button size="sm" className="w-full sm:w-auto">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-4xl w-full space-y-12">
          <h2 className="text-3xl sm:text-5xl font-bold text-white">
            Your Passwords, Secured with Military-Grade Encryption
          </h2>

          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
            Store, manage, and access your passwords securely from anywhere.
            Built with advanced encryption and powered by AWS.
          </p>

          {/* Grid of Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto mt-8">
            {/* Card 1: Secure */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-primary">Secure</CardTitle>
                <CardDescription>Military-grade encryption</CardDescription>
              </CardHeader>
              <CardContent>
                Your data is protected with the latest security standards
              </CardContent>
            </Card>

            {/* Card 2: Accessible */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-primary">Accessible</CardTitle>
                <CardDescription>Available anywhere</CardDescription>
              </CardHeader>
              <CardContent>
                Access your passwords securely from any device
              </CardContent>
            </Card>

            {/* Card 3: Simple */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-primary">Simple</CardTitle>
                <CardDescription>Easy to use</CardDescription>
              </CardHeader>
              <CardContent>
                Intuitive interface for managing your passwords
              </CardContent>
            </Card>

            {/* Card 4: Zero-Knowledge */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-primary">Zero-Knowledge</CardTitle>
                <CardDescription>Your data, your control</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Your passwords are encrypted on your device using your master
                  password.{" "}
                  <strong>AWS cannot access or decrypt your data.</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer (Optional) */}
      <footer className="w-full p-4 text-center text-zinc-500 text-sm">
        © {new Date().getFullYear()} SecureVault. All rights reserved.
      </footer>
    </div>
  );
}
