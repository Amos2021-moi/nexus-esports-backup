"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User as UserIcon,
  Gamepad2,
  Phone,
  Image as ImageIcon,
  Save,
  Loader2,
  Eye,
  EyeOff,
  AtSign,
  GraduationCap,
  Crown,
  Activity,
  X,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import ImageUpload from "@/components/dashboard/ImageUpload";
import toast from "react-hot-toast";

const BIO_MAX = 200;

/* -------------------------------------------------------------------------- */
/*                            Animation variants                              */
/* -------------------------------------------------------------------------- */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

/* Shared input styling for consistency. */
const inputClass =
  "min-h-[44px] w-full rounded-xl border border-white/10 bg-gray-900/60 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 transition focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40";

const labelClass = "mb-1.5 block text-sm font-medium text-gray-300";

export default function EditProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profilePicture, setProfilePicture] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    class: "",
    bio: "",
    favoriteClub: "",
    preferredFormation: "",
    preferredPlaystyle: "",
    whatsappNumber: "",
    whatsappVisible: true,
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();
        setFormData({
          username: data.username || "",
          name: data.name || "",
          class: data.class || "",
          bio: data.bio || "",
          favoriteClub: data.favoriteClub || "",
          preferredFormation: data.preferredFormation || "",
          preferredPlaystyle: data.preferredPlaystyle || "",
          whatsappNumber: data.whatsappNumber || "",
          whatsappVisible:
            data.whatsappVisible !== undefined ? data.whatsappVisible : true,
        });
        setProfilePicture(data.profilePicture || "");
        setBannerImage(data.bannerImage || "");
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchProfile();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profilePicture,
          bannerImage,
        }),
      });

      if (response.ok) {
        toast.success("Profile updated successfully!");
        router.push("/dashboard/profile");
      } else {
        const error = await response.json();
        toast.error(error.error || "Error updating profile");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error updating profile");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const target = e.target as HTMLInputElement;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <div className="text-gray-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  const bioLength = formData.bio.length;
  const bioOver = bioLength > BIO_MAX;

  return (
    <div className="relative mx-auto max-w-3xl">
      {/* Decorative gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-purple-600/15 blur-[120px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-6 flex items-center gap-3">
          <Link
            href="/dashboard/profile"
            aria-label="Back to profile"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={22} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Edit Profile
            </h1>
            <p className="text-sm text-gray-400">
              Update your details, gaming preferences and contact info.
            </p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Section */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl border border-white/10 bg-gray-800/40 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
                <ImageIcon className="h-5 w-5 text-white" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">Images</h2>
                <p className="text-xs text-gray-400">
                  Your profile picture and banner.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Profile Picture</label>
                <ImageUpload
                  type="profile"
                  currentImage={profilePicture}
                  onUpload={(url) => setProfilePicture(url)}
                />
              </div>
              <div>
                <label className={labelClass}>Banner Image</label>
                <ImageUpload
                  type="banner"
                  currentImage={bannerImage}
                  onUpload={(url) => setBannerImage(url)}
                />
              </div>
            </div>
          </motion.section>

          {/* Personal Information Section */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl border border-white/10 bg-gray-800/40 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                <UserIcon className="h-5 w-5 text-white" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Personal Information
                </h2>
                <p className="text-xs text-gray-400">
                  How you appear across Nexus Esports.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Display Name */}
              <div>
                <label htmlFor="name" className={labelClass}>
                  Display Name
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className={labelClass}>
                  Username <span className="text-pink-400">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <AtSign className="h-4 w-4" />
                  </span>
                  <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {/* Class */}
              <div className="sm:col-span-2">
                <label htmlFor="class" className={labelClass}>
                  Class
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <GraduationCap className="h-4 w-4" />
                  </span>
                  <select
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className={`${inputClass} pl-9`}
                  >
                    <option value="">Select Class</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="bio" className={labelClass}>
                    Bio
                  </label>
                  <span
                    className={`text-xs ${
                      bioOver ? "text-red-400" : "text-gray-500"
                    }`}
                  >
                    {bioLength}/{BIO_MAX}
                  </span>
                </div>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  maxLength={BIO_MAX}
                  className={`${inputClass} min-h-[96px] resize-y py-2.5`}
                  placeholder="Tell us about yourself..."
                />
                {bioOver && (
                  <p className="mt-1 text-xs text-red-400">
                    Bio must be {BIO_MAX} characters or fewer.
                  </p>
                )}
              </div>
            </div>
          </motion.section>

          {/* Gaming Preferences Section */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl border border-white/10 bg-gray-800/40 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
                <Gamepad2 className="h-5 w-5 text-white" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Gaming Preferences
                </h2>
                <p className="text-xs text-gray-400">
                  Your style on the pitch.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Favorite Club */}
              <div className="sm:col-span-2">
                <label htmlFor="favoriteClub" className={labelClass}>
                  Favorite Club
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Crown className="h-4 w-4" />
                  </span>
                  <input
                    id="favoriteClub"
                    type="text"
                    name="favoriteClub"
                    value={formData.favoriteClub}
                    onChange={handleChange}
                    placeholder="e.g., Real Madrid, Manchester City"
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {/* Preferred Formation */}
              <div>
                <label htmlFor="preferredFormation" className={labelClass}>
                  Preferred Formation
                </label>
                <select
                  id="preferredFormation"
                  name="preferredFormation"
                  value={formData.preferredFormation}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select Formation</option>
                  <option value="4-3-3">4-3-3</option>
                  <option value="4-4-2">4-4-2</option>
                  <option value="4-2-3-1">4-2-3-1</option>
                  <option value="3-5-2">3-5-2</option>
                  <option value="5-3-2">5-3-2</option>
                </select>
              </div>

              {/* Preferred Playstyle */}
              <div>
                <label htmlFor="preferredPlaystyle" className={labelClass}>
                  Preferred Playstyle
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 z-10">
                    <Activity className="h-4 w-4" />
                  </span>
                  <select
                    id="preferredPlaystyle"
                    name="preferredPlaystyle"
                    value={formData.preferredPlaystyle}
                    onChange={handleChange}
                    className={`${inputClass} pl-9`}
                  >
                    <option value="">Select Playstyle</option>
                    <option value="Possession">Possession</option>
                    <option value="Counter Attack">Counter Attack</option>
                    <option value="Long Ball">Long Ball</option>
                    <option value="Wing Play">Wing Play</option>
                    <option value="Tiki-Taka">Tiki-Taka</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Contact / WhatsApp Section */}
          <motion.section
            variants={itemVariants}
            className="rounded-2xl border border-white/10 bg-gray-800/40 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <Phone className="h-5 w-5 text-white" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Match Communication
                </h2>
                <p className="text-xs text-gray-400">
                  How opponents reach you to coordinate matches.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="whatsappNumber" className={labelClass}>
                WhatsApp Number (with country code)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  id="whatsappNumber"
                  type="tel"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="+254712345678"
                  className={`${inputClass} pl-9`}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Include country code. Example: +254712345678 for Kenya
              </p>
            </div>

            {/* Visibility toggle */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-gray-900/40 p-4">
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                    formData.whatsappVisible
                      ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                      : "bg-gray-700/40 text-gray-400 ring-1 ring-white/10"
                  }`}
                >
                  {formData.whatsappVisible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </span>
                <div>
                  <label
                    htmlFor="whatsappVisible"
                    className="block cursor-pointer text-sm font-medium text-gray-200"
                  >
                    Allow opponents to see my WhatsApp number
                  </label>
                  <span
                    className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      formData.whatsappVisible
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-gray-700/50 text-gray-400"
                    }`}
                  >
                    {formData.whatsappVisible ? "Visible" : "Hidden"}
                  </span>
                </div>
              </div>

              {/* Accessible switch (keeps native checkbox name/checked binding) */}
              <label
                htmlFor="whatsappVisible"
                className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer items-center"
              >
                <input
                  type="checkbox"
                  id="whatsappVisible"
                  name="whatsappVisible"
                  checked={formData.whatsappVisible}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <span className="h-7 w-12 rounded-full bg-gray-600 transition-colors peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500/50" />
                <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              </label>
            </div>
          </motion.section>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col-reverse gap-3 sm:flex-row"
          >
            <Link
              href="/dashboard/profile"
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-center text-sm font-semibold text-gray-200 transition hover:bg-white/10"
            >
              <X className="h-4 w-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
