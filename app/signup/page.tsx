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

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match",
      });
      return;
    }

    if (!masterPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Master password is required",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://ig2rl7z3j7.execute-api.ap-south-1.amazonaws.com/dev/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: email,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Check your email for the confirmation code",
        });
        setShowConfirmation(true);
      } else {
        throw new Error(data.error || "Signup failed");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Signup failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Confirm with Cognito
      const confirmResponse = await fetch(
        "https://ig2rl7z3j7.execute-api.ap-south-1.amazonaws.com/dev/confirm",

        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: email,
            confirmationCode: confirmationCode.trim(),
          }),
        }
      );

      const confirmData = await confirmResponse.json();
      if (!confirmResponse.ok) {
        throw new Error(confirmData.error || "Confirmation failed");
      }

      // Step 2: Log in to get fresh tokens
      const loginResponse = await fetch(
        "https://ig2rl7z3j7.execute-api.ap-south-1.amazonaws.com/dev/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: email,
            password,
          }),
        }
      );

      const loginData = await loginResponse.json();
      if (!loginResponse.ok) {
        throw new Error(loginData.message || "Post-confirmation login failed");
      }

      // Store tokens
      localStorage.setItem("accessToken", loginData.tokens.AccessToken);
      localStorage.setItem("idToken", loginData.tokens.IdToken);
      localStorage.setItem("refreshToken", loginData.tokens.RefreshToken);
      localStorage.setItem("userEmail", email);

      // Step 3: Encrypt master password
      const key = CryptoJS.PBKDF2(password, email, {
        keySize: 256 / 32,
        iterations: 10000,
      }).toString();

      const encryptedMasterPassword = CryptoJS.AES.encrypt(
        masterPassword,
        key
      ).toString();

      // Step 4: Prepare payload and log it
      const payload = {
        username: email,
        encryptedMasterKey: encryptedMasterPassword, // Changed to match backend expectation
      };
      console.log("Payload for store-master-key:", payload);

      // Step 5: Store encrypted master password with idToken
      const masterResponse = await fetch(
        "https://c3cnftu0oj.execute-api.ap-south-1.amazonaws.com/dev/store-master-key",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: loginData.tokens.IdToken,
          },
          body: JSON.stringify(payload),
        }
      );

      const masterData = await masterResponse.json();
      if (!masterResponse.ok) {
        console.error(
          "Master password storage failed:",
          masterResponse.status,
          masterData
        );
        throw new Error(
          masterData.message ||
            `Failed to store master password (Status: ${masterResponse.status})`
        );
      }

      // Step 6: Store master password in sessionStorage
      sessionStorage.setItem("masterPassword", masterPassword);

      toast({
        title: "Success",
        description:
          "Account created successfully. Redirecting to dashboard...",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Confirmation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Confirmation failed",
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
            <CardTitle className="text-2xl text-primary">
              {showConfirmation ? "Confirm Email" : "Sign Up"}
            </CardTitle>
          </div>
          <CardDescription>
            {showConfirmation
              ? "Enter the confirmation code sent to your email"
              : "Create your account to get started"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showConfirmation ? (
            <form onSubmit={handleSignup} className="space-y-4">
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
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? (
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
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleConfirmation} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Confirmation Code"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Confirming..." : "Confirm Email"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
