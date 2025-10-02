// src/pages/UserProfilePage.tsx
import React, { useEffect, useRef, useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { CameraIcon } from "@heroicons/react/24/outline";
import { useLogin } from "../state/login/useLogin";
import { updateStudent, changeStudentPassword } from "../services/housing";

type UserProfile = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  faculty?: string;
  index?: string;
  role?: string;
  avatarUrl?: string;
};

const fallbackAvatar =
  "https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundType=gradientLinear";

const UserProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    faculty: "",
    index: "",
    role: "",
    avatarUrl: fallbackAvatar,
  });

  const [userId, setUserId] = useState<string | number | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { getUserById } = useLogin();

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await getUserById();
        const anyU = u as any;
        const id = anyU?.id ?? anyU?.userId ?? anyU?._id ?? anyU?.ID ?? null;
        setUserId(id);

        const generatedAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          `${u.firstName ?? "User"} ${u.lastName ?? ""}`.trim()
        )}&backgroundType=gradientLinear`;
        const avatar = anyU?.avatarUrl ?? anyU?.avatar ?? generatedAvatar;

        setProfile((p) => ({
          ...p,
          firstName: u.firstName ?? "",
          lastName: u.lastName ?? "",
          username: u.username ?? "",
          email: u.email ?? "",
          faculty: anyU?.faculty ?? "",
          index: anyU?.index ?? "",
          role: anyU?.role ?? "",
          avatarUrl: avatar,
        }));
      } catch {
        setMessage({ type: "error", text: "Failed to load user profile." });
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPickAvatar = () => fileRef.current?.click();
  const onAvatarChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    const url = URL.createObjectURL(f);
    setProfile((p) => ({ ...p, avatarUrl: url }));
  };

  const onField =
    (key: keyof UserProfile) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setProfile((p) => ({ ...p, [key]: e.target.value }));
    };

  const buildPayload = () => ({
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    username: profile.username ?? "",
    faculty: profile.faculty ?? "",
    index: profile.index ?? "",
  });

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loadingUser) {
      setMessage({
        type: "error",
        text: "Please wait until the profile loads.",
      });
      return;
    }
    if (!userId) {
      setMessage({ type: "error", text: "User id not available." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const payload = buildPayload();
      await updateStudent(String(userId), payload);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err: any) {
      const txt =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update profile.";
      setMessage({ type: "error", text: txt });
    } finally {
      setSubmitting(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setMessage({ type: "error", text: "User id not available." });
      return;
    }

    setMessage(null);

    if (!oldPass && !newPass && !confirmPass) {
      setMessage({ type: "success", text: "No password change." });
      return;
    }
    if (!oldPass) {
      setMessage({ type: "error", text: "Current password is required." });
      return;
    }
    if (newPass !== confirmPass) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (
      newPass.length < 8 ||
      !/[A-Za-z]/.test(newPass) ||
      !/[0-9]/.test(newPass)
    ) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters and include a letter and a digit.",
      });
      return;
    }

    try {
      await changeStudentPassword(String(userId), oldPass, newPass);
      setMessage({ type: "success", text: "Password updated successfully." });
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (err: any) {
      const txt =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update password.";
      setMessage({ type: "error", text: txt });
    }
  };

  return (
    <div className="bg-white">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <p className="text-gray-500 text-sm">
            Manage your personal information and account details.
          </p>
        </div>

        {message && (
          <div
            role="alert"
            className={`mb-6 rounded-xl border px-3 py-2 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <aside className="col-span-12 lg:col-span-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={profile.avatarUrl || fallbackAvatar}
                    alt="User avatar"
                    className="h-40 w-40 rounded-2xl object-cover ring-1 ring-gray-200"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        fallbackAvatar;
                    }}
                  />
                  <button
                    type="button"
                    onClick={onPickAvatar}
                    className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-xl bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-900 shadow hover:bg-white"
                  >
                    <CameraIcon className="h-4 w-4" />
                    Change
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatarChange}
                  />
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900 break-all">
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <section className="col-span-12 lg:col-span-8">
            <form
              onSubmit={saveProfile}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your profile details.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <input
                    value={profile.firstName}
                    onChange={onField("firstName")}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <input
                    value={profile.lastName}
                    onChange={onField("lastName")}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Faculty
                  </label>
                  <input
                    value={profile.faculty || ""}
                    onChange={onField("faculty")}
                    placeholder="e.g., ETF"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Index
                  </label>
                  <input
                    value={profile.index || ""}
                    onChange={onField("index")}
                    placeholder="e.g., 2021/0001"
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <input
                    value={profile.role || ""}
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={submitting || loadingUser || !userId}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setMessage(null)}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>

            <form
              onSubmit={submitPassword}
              className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your password.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Current password
                  </label>
                  <input
                    type="password"
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="••••••••"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum 8 characters, include a letter and a digit.
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
                >
                  Update password
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserProfilePage;
