"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import CryptoJS from "crypto-js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Cognito login
      const loginResponse = await fetch(
        "https://ig2rl7z3j7.execute-api.ap-south-1.amazonaws.com/dev/login",

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
            password,
          }),
        }
      );

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) {
        throw new Error(loginData.message || "Login failed");
      }

      // Store Cognito tokens
      localStorage.setItem("accessToken", loginData.tokens.AccessToken);
      localStorage.setItem("idToken", loginData.tokens.IdToken);
      localStorage.setItem("refreshToken", loginData.tokens.RefreshToken);
      localStorage.setItem("userEmail", email);

      // Derive key from login password
      const key = CryptoJS.PBKDF2(password, email, {
        keySize: 256 / 32,
        iterations: 10000,
      }).toString();

      // Fetch encrypted master password
      const masterResponse = await fetch(
        "https://c3cnftu0oj.execute-api.ap-south-1.amazonaws.com/dev/get-master-key",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: loginData.tokens.IdToken,
          },
          body: JSON.stringify({
            username: email,
          }),
        }
      );

      const masterData = await masterResponse.json();
      if (!masterResponse.ok) {
        throw new Error(
          masterData.message || "Failed to fetch master password"
        );
      }

      // Log the response to debug
      console.log("Master key response:", masterData);

      // Check if encryptedMasterKey exists
      if (!masterData.encryptedMasterKey) {
        throw new Error("Encrypted master key not found in response");
      }

      // Decrypt the master password
      const decryptedMasterPassword = CryptoJS.AES.decrypt(
        masterData.encryptedMasterKey,
        key
      ).toString(CryptoJS.enc.Utf8);

      if (!decryptedMasterPassword) {
        throw new Error("Decryption failed: Invalid key or corrupted data");
      }

      if (decryptedMasterPassword !== masterPassword) {
        throw new Error("Invalid master password");
      }

      // Store in sessionStorage
      sessionStorage.setItem("masterPassword", decryptedMasterPassword);

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-800/50 border-zinc-700">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl text-primary">Login</CardTitle>
          </div>
          <CardDescription>
            Enter your credentials to access your vault
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showMasterPassword ? "text" : "password"}
                  placeholder="Master Password"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowMasterPassword(!showMasterPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showMasterPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-sm text-zinc-400">
                Your master password is required to decrypt your stored
                passwords. Please ensure you remember it, as it cannot be
                recovered.
              </p>
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
