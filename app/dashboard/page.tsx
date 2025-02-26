"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Plus, Copy, Eye, EyeOff, Edit, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CryptoJS from "crypto-js";

// Input Modal Component
interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { website: string; password: string }) => void;
  title: string;
  initialValues?: { website?: string };
  isEdit?: boolean;
}

const InputModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialValues = {},
  isEdit = false,
}: InputModalProps) => {
  const [website, setWebsite] = useState(initialValues.website || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!password || (!isEdit && !website)) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit({
      website: isEdit ? initialValues.website || "" : website,
      password,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
        <div className="space-y-4">
          {!isEdit && (
            <Input
              placeholder="Website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="bg-zinc-700 text-white border-zinc-600"
            />
          )}
          {isEdit && (
            <div className="text-white">Website: {initialValues.website}</div>
          )}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-700 text-white border-zinc-600 pr-10"
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
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-white">Confirm Action</h2>
        <p className="text-white mb-6">{message}</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            No
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = ({ isLoading }: { isLoading: boolean }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
    </div>
  );
};

export default function Dashboard() {
  interface PasswordEntry {
    passwordId: string;
    website: string;
    encryptedPassword: string;
    createdAt: string;
  }

  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputModalOpen, setInputModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "update">("add");
  const [selectedPassword, setSelectedPassword] =
    useState<PasswordEntry | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [passwordToDelete, setPasswordToDelete] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");

  const { toast } = useToast();
  const router = useRouter();

  // Retrieve master password from sessionStorage
  const masterPassword = sessionStorage.getItem("masterPassword") || "";

  const API_BASE_URL =
    "";

  const getEncryptionKey = () => {
    if (!masterPassword) throw new Error("Master password not found");
    return CryptoJS.SHA256(masterPassword).toString();
  };

  const fetchPasswords = async () => {
    const idToken = localStorage.getItem("idToken");
    if (!idToken) {
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/getPasswords`, {
        method: "GET",
        headers: { Authorization: idToken },
      });

      const data = await response.json();
      if (response.ok) {
        setPasswords(data.passwords || []);
        const email =
          localStorage.getItem("userEmail") ||
          decodeJWT(idToken)?.email ||
          "user@example.com";
        setUserEmail(email);
      } else {
        throw new Error(data.message || "Failed to fetch passwords");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
      if ((error as Error).message.includes("Unauthorized"))
        router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (!masterPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Master password is required. Please log in again.",
      });
      router.push("/login");
    } else {
      fetchPasswords();
    }
  }, [masterPassword, router, toast]);

  const handleAddPassword = () => {
    setModalType("add");
    setInputModalOpen(true);
  };

  const handleModalSubmit = async ({
    website,
    password,
  }: {
    website: string;
    password: string;
  }) => {
    const encryptionKey = getEncryptionKey();
    const encryptedPassword = CryptoJS.AES.encrypt(
      password,
      encryptionKey
    ).toString();

    setLoading(true);
    try {
      const idToken = localStorage.getItem("idToken");
      if (!idToken) {
        router.push("/login");
        return;
      }

      const response =
        modalType === "add"
          ? await fetch(`${API_BASE_URL}/add`, {
              method: "POST",
              headers: {
                Authorization: idToken,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ website, encryptedPassword }),
            })
          : await fetch(`${API_BASE_URL}/update`, {
              method: "POST",
              headers: {
                Authorization: idToken,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                passwordId: selectedPassword?.passwordId,
                website,
                newEncryptedPassword: encryptedPassword,
              }),
            });

      const data = await response.json();
      if (response.ok) {
        if (modalType === "add") {
          setPasswords([
            ...passwords,
            {
              passwordId: data.passwordId,
              website,
              encryptedPassword,
              createdAt: new Date().toISOString(),
            },
          ]);
        } else {
          setPasswords(
            passwords.map((p) =>
              p.passwordId === selectedPassword?.passwordId
                ? {
                    ...p,
                    website,
                    encryptedPassword,
                    createdAt: new Date().toISOString(),
                  }
                : p
            )
          );
        }
        toast({
          title: "Success",
          description: `Password ${modalType === "add" ? "added" : "updated"}`,
        });
      } else {
        throw new Error(data.message || `Failed to ${modalType} password`);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
      if ((error as Error).message.includes("Unauthorized"))
        router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = (entry: PasswordEntry) => {
    setModalType("update");
    setSelectedPassword(entry);
    setInputModalOpen(true);
  };

  const handleDeletePassword = (passwordId: string) => {
    setPasswordToDelete(passwordId);
    setConfirmModalOpen(true);
  };

  const confirmDeletePassword = async () => {
    if (!passwordToDelete) return;

    setLoading(true);
    try {
      const idToken = localStorage.getItem("idToken");
      if (!idToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/delete`, {
        method: "POST",
        headers: {
          Authorization: idToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ passwordId: passwordToDelete }),
      });

      if (response.ok) {
        setPasswords(
          passwords.filter((p) => p.passwordId !== passwordToDelete)
        );
        toast({ title: "Success", description: "Password deleted" });
      } else {
        throw new Error("Failed to delete password");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
      if ((error as Error).message.includes("Unauthorized"))
        router.push("/login");
    } finally {
      setLoading(false);
      setConfirmModalOpen(false);
      setPasswordToDelete(null);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) {
      fetchPasswords();
      return;
    }

    setLoading(true);
    try {
      const idToken = localStorage.getItem("idToken");
      if (!idToken) {
        router.push("/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: {
          Authorization: idToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      if (response.ok) {
        setPasswords(data.passwords || []);
      } else {
        throw new Error(data.message || "Failed to search passwords");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message,
      });
      if ((error as Error).message.includes("Unauthorized"))
        router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const decryptPassword = (encryptedPassword: string) => {
    try {
      const encryptionKey = getEncryptionKey();
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, encryptionKey);
      const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
      return decryptedPassword || "Decryption Failed";
    } catch (error) {
      console.error("Decryption Error:", error);
      return "Decryption Error";
    }
  };

  const handleCopyPassword = (encryptedPassword: string) => {
    setLoading(true);
    const plainPassword = decryptPassword(encryptedPassword);
    navigator.clipboard.writeText(plainPassword);
    toast({ title: "Copied", description: "Password copied to clipboard" });
    setLoading(false);
  };

  const handleLogout = () => {
    setLoading(true);
    sessionStorage.removeItem("masterPassword");
    localStorage.clear();
    router.push("/login");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950 p-6">
      <div className="max-w-6xl mx-auto space-y-8 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">
              Password Manager
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <Button onClick={handleAddPassword} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                {loading ? "Adding..." : "Add Password"}
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={loading}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardHeader>
              <CardTitle className="text-xl">Total Passwords</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{passwords.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardHeader>
            <CardTitle>Your Passwords</CardTitle>
            <span className="text-white text-sm">
              {userEmail || "Loading email..."}
            </span>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex space-x-2">
              <Input
                placeholder="Search passwords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Website</TableHead>
                  <TableHead>Password</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {passwords.map((entry) => (
                  <TableRow key={entry.passwordId}>
                    <TableCell>{entry.website}</TableCell>
                    <TableCell>
                      {showPassword === entry.passwordId
                        ? decryptPassword(entry.encryptedPassword)
                        : "********"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleCopyPassword(entry.encryptedPassword)
                          }
                          disabled={loading}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setShowPassword(
                              showPassword === entry.passwordId
                                ? null
                                : entry.passwordId
                            )
                          }
                          disabled={loading}
                        >
                          {showPassword === entry.passwordId ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUpdatePassword(entry)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePassword(entry.passwordId)}
                          disabled={loading}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <InputModal
          isOpen={inputModalOpen}
          onClose={() => setInputModalOpen(false)}
          onSubmit={handleModalSubmit}
          title={modalType === "add" ? "Add New Password" : "Update Password"}
          initialValues={
            modalType === "update" ? { website: selectedPassword?.website } : {}
          }
          isEdit={modalType === "update"}
        />

        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => {
            setConfirmModalOpen(false);
            setPasswordToDelete(null);
          }}
          onConfirm={confirmDeletePassword}
          message="Are you sure you want to delete this password?"
        />

        <LoadingSpinner isLoading={loading} />
      </div>
    </div>
  );
}
