"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { statfs, writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendReleaseStatusEmail,
  sendPayoutStatusEmail,
  sendAnalyticsReadyEmail,
  sendRequestStatusEmail
} from "@/lib/mail";

// Prisma Singleton logic inside actions.ts to avoid build resolution issues
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// @ts-ignore
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// @ts-ignore
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export async function checkServerStorage() {
  try {
    // Check current working directory drive
    const stats = await statfs(process.cwd());
    const freeBytes = stats.bfree * stats.bsize;
    const minFreeBytes = 500 * 1024 * 1024; // 500MB threshold
    return { isFull: freeBytes < minFreeBytes, freeSpace: freeBytes };
  } catch (e) {
    console.error("Storage check failed:", e);
    return { isFull: false, freeSpace: 0 }; // Default to allow upload if check fails, or assume full if critical
  }
}

// --- Schemas ---
const releaseSchema = z.object({
  title: z.string().min(1),
  version: z.string().optional(),
  type: z.enum(["SINGLE", "EP", "ALBUM"]),
  genre: z.string().min(1),
  instrumental: z.boolean().optional(),
  language: z.string().optional(),
  releaseDate: z.string(),
  mainArtist: z.string().min(1),
  featArtists: z.string().optional(),
  comment: z.string().optional(),
  promoRequest: z.boolean().optional(),
  promoReleaseInfo: z.string().optional(),
  promoArtistInfo: z.string().optional(),
  promoMarketingInfo: z.string().optional(),
  coverData: z.string().optional(), // Base64
  tracks: z.array(z.object({
    title: z.string().min(1),
    version: z.string().optional(),
    mainArtist: z.string().optional(),
    featArtists: z.string().optional(),
    composer: z.string().min(1),
    lyricist: z.string().optional(),
    instrumental: z.boolean(),
    ffp: z.boolean().optional(),
    explicit: z.boolean().optional(),
    fileData: z.string().optional(), // Base64
    fileName: z.string().optional(),
  })),
});

const newsSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  image: z.string().optional(), // Base64 or URL
});

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).optional(), // Optional for login
});

const profileSchema = z.object({
  name: z.string().min(2),
  bio: z.string().optional(),
  avatarData: z.string().optional(), // Base64
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

const analyticsSchema = z.object({
  artistId: z.string().min(1),
  quarter: z.string().min(1),
  totalStreams: z.number().min(0),
  uniqueListeners: z.number().min(0),
  platformStats: z.record(z.string(), z.number()),
  countryStats: z.record(z.string(), z.number()),
  trackStats: z.array(z.object({
    trackId: z.string().min(1),
    streams: z.number().min(0),
  })),
});

const financialReportSchema = z.object({
  artistId: z.string().min(1),
  quarter: z.string().min(1),
  title: z.string().min(1),
  amount: z.number().min(0),
  fileData: z.string().optional(), // Base64
  linkUrl: z.string().optional(),
});

const payoutRequestSchema = z.object({
  amount: z.number().min(1),
  method: z.string().min(1),
  details: z.string().min(1), // JSON string of details
});

// --- Helper ---
async function getNextPublicId() {
  const lastUser = await prisma.user.findFirst({
    orderBy: { publicId: 'desc' }
  });
  return (lastUser?.publicId || 99) + 1;
}

async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, message, link }
    });
  } catch (error) {
    console.error("Failed to create notification", error);
  }
}

async function broadcastNotification(type: string, title: string, message: string, link?: string) {
  const users = await prisma.user.findMany({ select: { id: true } });
  for (const user of users) {
    await createNotification(user.id, type, title, message, link);
  }
}

async function notifyAdmins(type: string, title: string, message: string, link?: string) {
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
  for (const admin of admins) {
    await createNotification(admin.id, type, title, message, link);
  }
}

// --- Auth Actions ---

export async function registerUser(formData: z.infer<typeof authSchema>) {
  const result = authSchema.safeParse(formData);
  if (!result.success) return { success: false, error: "Validation failed" };

  try {
    const publicId = await getNextPublicId();
    const user = await prisma.user.create({
      data: {
        email: result.data.email,
        password: result.data.password, 
        name: result.data.name || "Artist",
        role: "ARTIST",
        publicId: publicId
      }
    });
    
    cookies().set("user_id", user.id, { httpOnly: true, path: "/" });
    return { success: true };
  } catch (error) {
    return { success: false, error: "User already exists" };
  }
}

export async function createUserByAdmin(data: { name: string; email: string; tariff: string; tariffPeriod: string }) {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return { success: false, error: "Unauthorized" };

  // Check if admin
  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  if (currentUser?.role !== 'ADMIN') return { success: false, error: "Forbidden" };

  try {
    const publicId = await getNextPublicId();
    // Generate random password (8 chars)
    const password = Math.random().toString(36).slice(-8);
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: password,
        name: data.name,
        role: "ARTIST",
        tariff: data.tariff,
        tariffPeriod: data.tariffPeriod,
        publicId: publicId
      }
    });

    // Send Email
    try {
      await sendWelcomeEmail(data.email, data.name, password);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }
    
    return { success: true, user, password };
  } catch (error) {
    return { success: false, error: "User already exists or error" };
  }
}

export async function loginUser(formData: z.infer<typeof authSchema>) {
  const result = authSchema.safeParse(formData);
  if (!result.success) return { success: false, error: "Validation failed" };

  try {
    const user = await prisma.user.findUnique({
      where: { email: result.data.email }
    });

    if (user && user.password === result.data.password) {
      cookies().set("user_id", user.id, { httpOnly: true, path: "/" });
      return { success: true };
    }
    return { success: false, error: "Invalid credentials" };
  } catch (error) {
    return { success: false, error: "Login failed" };
  }
}

export async function logoutUser() {
  cookies().delete("user_id");
  redirect("/login");
}

export async function getCurrentUser() {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return null;
  return await prisma.user.findUnique({ where: { id: userId } });
}

// --- Profile Actions ---

export async function updateProfile(formData: z.infer<typeof profileSchema>) {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return { success: false, error: "Unauthorized" };

  const result = profileSchema.safeParse(formData);
  if (!result.success) return { success: false, error: "Validation failed" };

  try {
    const data = result.data;
    let avatarUrl = data.avatarData;

    // Save avatar to disk if it's base64
    if (data.avatarData && data.avatarData.startsWith("data:image")) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
      await mkdir(uploadDir, { recursive: true });
      
      const base64Data = data.avatarData.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = `${userId}-${randomUUID()}.jpg`;
      await writeFile(path.join(uploadDir, fileName), buffer);
      avatarUrl = `/uploads/avatars/${fileName}`;
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        bio: data.bio,
        avatarUrl: avatarUrl
      }
    });
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Update failed" };
  }
}

export async function changePassword(formData: z.infer<typeof passwordSchema>) {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return { success: false, error: "Unauthorized" };

  const result = passwordSchema.safeParse(formData);
  if (!result.success) return { success: false, error: "Validation failed" };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.password !== result.data.currentPassword) {
      return { success: false, error: "Incorrect current password" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password: result.data.newPassword }
    });

    // Send Email notification
    try {
      await sendPasswordChangedEmail(user.email, user.name);
    } catch (emailError) {
      console.error("Failed to send password change email:", emailError);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Password update failed" };
  }
}

// --- Artist Actions ---

export async function createRelease(formData: z.infer<typeof releaseSchema>) {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return { success: false, error: "Unauthorized" };

  const result = releaseSchema.safeParse(formData);

  if (!result.success) {
    console.error("Validation failed:", result.error.format());
    return { success: false, error: "Validation failed: " + JSON.stringify(result.error.format()) };
  }

  const data = result.data;

  try {
    // 1. Create Upload Directories
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const coversDir = path.join(uploadDir, "covers");
    const audioDir = path.join(uploadDir, "audio");
    
    await mkdir(coversDir, { recursive: true });
    await mkdir(audioDir, { recursive: true });

    // 2. Save Cover Image
    let coverUrl = "";
    if (data.coverData && data.coverData.startsWith("data:image")) {
      const base64Data = data.coverData.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = `${randomUUID()}.jpg`;
      const filePath = path.join(coversDir, fileName);
      await writeFile(filePath, buffer);
      coverUrl = `/uploads/covers/${fileName}`;
    }

    // 3. Process Tracks and Save Audio Files
    const tracksWithUrls = await Promise.all(data.tracks.map(async (track, index) => {
      let fileUrl = "";
      if (track.fileData && track.fileData.startsWith("data:audio")) {
        const base64Data = track.fileData.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");
        const fileName = `${randomUUID()}.wav`;
        const filePath = path.join(audioDir, fileName);
        await writeFile(filePath, buffer);
        fileUrl = `/uploads/audio/${fileName}`;
      } else if (track.fileData && track.fileData.startsWith("http")) {
        // If it's already a link (e.g. storage full fallback)
        fileUrl = track.fileData;
      }

      return {
        position: index + 1,
        title: track.title,
        version: track.version,
        mainArtist: track.mainArtist,
        featArtists: track.featArtists,
        composer: track.composer,
        lyricist: track.lyricist,
        instrumental: track.instrumental,
        ffp: track.ffp || false,
        explicit: track.explicit || false,
        fileUrl: fileUrl,
      };
    }));

    // 4. Save to Database
    const release = await prisma.release.create({
      data: {
        title: data.title,
        version: data.version,
        type: data.type,
        genre: data.genre,
        instrumental: data.instrumental || false,
        language: data.language,
        releaseDate: new Date(data.releaseDate),
        mainArtist: data.mainArtist,
        featArtists: data.featArtists,
        comment: data.comment,
        promoRequest: data.promoRequest || false,
        promoReleaseInfo: data.promoReleaseInfo,
        promoArtistInfo: data.promoArtistInfo,
        promoMarketingInfo: data.promoMarketingInfo,
        coverUrl: coverUrl,
        artistId: userId,
        tracks: {
          create: tracksWithUrls,
        },
      },
    });

    revalidatePath("/releases");
    return { success: true, releaseId: release.id };
    
  } catch (error) {
    console.error("Failed to create release:", error);
    return { success: false, error: "Database error: " + (error as Error).message };
  }
}

export async function getArtistReleases() {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return [];

  try {
    return await prisma.release.findMany({
      where: { artistId: userId },
      select: {
        id: true,
        title: true,
        mainArtist: true,
        status: true,
        releaseDate: true,
        coverUrl: true,
        createdAt: true,
        // tracks are excluded here because they contain large fileData
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Get artist releases error:", error);
    return [];
  }
}

// --- Admin Actions ---

export async function getPendingReleases() {
  try {
    const releases = await prisma.release.findMany({
      select: {
        id: true,
        title: true,
        mainArtist: true,
        status: true,
        type: true,
        releaseDate: true,
        coverUrl: true,
        createdAt: true,
        artist: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Sort by tariff (PREMIUM first)
    return releases.sort((a, b) => {
      if (a.artist.tariff === 'PREMIUM' && b.artist.tariff !== 'PREMIUM') return -1;
      if (a.artist.tariff !== 'PREMIUM' && b.artist.tariff === 'PREMIUM') return 1;
      return 0;
    });

  } catch (error) {
    console.error("Get pending error:", error);
    return [];
  }
}

export async function getReleaseById(id: string) {
  try {
    console.log("Fetching release by ID:", id);
    const release = await prisma.release.findUnique({
      where: { id },
      include: {
        artist: true,
        tracks: { orderBy: { position: 'asc' } }
      }
    });
    
    if (!release) {
      console.log("Release not found for ID:", id);
      return null;
    }

    return release;
  } catch (error) {
    console.error("CRITICAL ERROR in getReleaseById:", error);
    // Throwing error here will trigger the Next.js error boundary/server-side exception page
    // allowing us to see the error in PM2 logs
    throw error;
  }
}

export async function updateReleaseStatus(id: string, status: string, upc?: string, rejectionReason?: string) {
  try {
    const release = await prisma.release.update({
      where: { id },
      data: { 
        status,
        upc: upc || undefined,
        rejectionReason: rejectionReason || undefined
      },
      include: { artist: true }
    });

    // Notify Artist
    if (status === 'APPROVED') {
      await createNotification(
        release.artistId, 
        'RELEASE_APPROVED', 
        'Релиз одобрен', 
        `Ваш релиз "${release.title}" был успешно одобрен!`, 
        `/releases/${release.id}`
      );
      // Email Notification
      try {
        await sendReleaseStatusEmail(release.artist.email, release.artist.name, release.title, 'APPROVED', upc, undefined, release.id);
      } catch (emailError) {
        console.error("Failed to send release approved email:", emailError);
      }
    } else if (status === 'REJECTED') {
      await createNotification(
        release.artistId,
        'RELEASE_REJECTED',
        'Релиз отклонен',
        `Ваш релиз "${release.title}" был отклонен. Причина: ${rejectionReason}`,
        `/releases/${release.id}`
      );
      // Email Notification
      try {
        await sendReleaseStatusEmail(release.artist.email, release.artist.name, release.title, 'REJECTED', undefined, rejectionReason, release.id);
      } catch (emailError) {
        console.error("Failed to send release rejected email:", emailError);
      }
    }

    revalidatePath("/admin/dashboard");
    revalidatePath(`/admin/release/${id}`);
    revalidatePath("/releases");
    revalidatePath(`/releases/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Update status error:", error);
    return { success: false, error: "Failed to update status" };
  }
}

// --- Admin Users Actions ---

export async function getUsers() {
  try {
    // Migration Logic: Assign IDs to users who have 0
    const usersWithoutId = await prisma.user.findMany({ where: { publicId: 0 } });
    if (usersWithoutId.length > 0) {
      let nextId = await getNextPublicId();
      for (const user of usersWithoutId) {
        await prisma.user.update({
          where: { id: user.id },
          data: { publicId: nextId++ }
        });
      }
    }

    return await prisma.user.findMany({
      orderBy: { publicId: 'asc' },
      include: { _count: { select: { releases: true } } }
    });
  } catch (error) {
    console.error("Get users error:", error);
    return [];
  }
}

export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
      include: { releases: { orderBy: { createdAt: 'desc' } } }
    });
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}

export async function updateUserTariff(userId: string, tariff: string, tariffPeriod: string) {
  const currentUserId = cookies().get("user_id")?.value;
  if (!currentUserId) return { success: false, error: "Unauthorized" };

  // Check if admin
  const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
  if (currentUser?.role !== 'ADMIN') return { success: false, error: "Forbidden" };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { tariff, tariffPeriod }
    });
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Update tariff error:", error);
    return { success: false, error: "Update failed: " + (error as Error).message };
  }
}

// --- News Actions ---

export async function createNews(formData: z.infer<typeof newsSchema>) {
  const result = newsSchema.safeParse(formData);
  if (!result.success) return { success: false, error: "Validation failed" };

  try {
    const data = result.data;
    let imageUrl = data.image;

    // Save news image to disk if it's base64
    if (data.image && data.image.startsWith("data:image")) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "news");
      await mkdir(uploadDir, { recursive: true });
      
      const base64Data = data.image.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const fileName = `${randomUUID()}.jpg`;
      await writeFile(path.join(uploadDir, fileName), buffer);
      imageUrl = `/uploads/news/${fileName}`;
    }

    await prisma.news.create({
      data: {
        ...data,
        image: imageUrl
      }
    });
    
    // Broadcast Notification
    await broadcastNotification(
      'NEW_NEWS',
      'Новая новость',
      `Опубликована новость: ${result.data.title}`,
      '/'
    );

    revalidatePath("/");
    revalidatePath("/admin/news");
    return { success: true };
  } catch (error) {
    console.error("Create news error:", error);
    return { success: false, error: "Failed to create news" };
  }
}

export async function deleteNews(id: string) {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return { success: false, error: "Unauthorized" };

  // Check if admin
  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  if (currentUser?.role !== 'ADMIN') return { success: false, error: "Forbidden" };

  try {
    await prisma.news.delete({
      where: { id }
    });
    revalidatePath("/");
    revalidatePath("/admin/news");
    return { success: true };
  } catch (error) {
    console.error("Delete news error:", error);
    return { success: false, error: "Failed to delete news" };
  }
}

export async function getNews(limit?: number) {
  try {
    return await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  } catch (error) {
    console.error("Get news error:", error);
    return [];
  }
}

export async function getNewsById(id: string) {
  try {
    return await prisma.news.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error("Get news by id error:", error);
    return null;
  }
}

// --- Analytics Actions ---

export async function createAnalytics(formData: z.infer<typeof analyticsSchema>) {
  const result = analyticsSchema.safeParse(formData);
  if (!result.success) return { success: false, error: "Validation failed" };

  try {
    await prisma.analyticsReport.create({
      data: {
        artistId: result.data.artistId,
        quarter: result.data.quarter,
        totalStreams: result.data.totalStreams,
        uniqueListeners: result.data.uniqueListeners,
        platformStats: JSON.stringify(result.data.platformStats),
        countryStats: JSON.stringify(result.data.countryStats),
        trackStats: {
          create: result.data.trackStats
        }
      }
    });

    // Notify Artist
    await createNotification(
      result.data.artistId,
      'ANALYTICS_READY',
      'Доступна статистика',
      `Статистика за ${result.data.quarter} уже доступна!`,
      '/analytics'
    );

    // Email Notification
    const artist = await prisma.user.findUnique({ where: { id: result.data.artistId } });
    if (artist) {
      try {
        await sendAnalyticsReadyEmail(artist.email, artist.name, result.data.quarter);
      } catch (emailError) {
        console.error("Failed to send analytics email:", emailError);
      }
    }

    revalidatePath("/analytics");
    return { success: true };
  } catch (error) {
    console.error("Create analytics error:", error);
    return { success: false, error: "Failed to create report" };
  }
}

export async function getArtistAnalytics() {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return [];

  try {
    return await prisma.analyticsReport.findMany({
      where: { artistId: userId },
      include: { trackStats: { include: { track: true } } },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return [];
  }
}

// Admin helper to get user's tracks for the form
export async function getUserTracks(artistId: string) {
  try {
    // Find all tracks from all releases of this artist
    const releases = await prisma.release.findMany({
      where: { artistId },
      include: { tracks: true }
    });
    return releases.flatMap(r => r.tracks);
  } catch (error) {
    return [];
  }
}

export async function getUserReleasesWithTracks(artistId: string) {
  try {
    return await prisma.release.findMany({
      where: { artistId },
      include: { tracks: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Get user releases error:", error);
    return [];
  }
}

// --- Notification Actions ---

export async function getNotifications() {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return [];

  try {
    return await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return [];
  }
}

export async function markAllNotificationsAsRead() {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return { success: false };

  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    revalidatePath("/"); // Revalidate everywhere basically
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// --- Finance Actions ---

export async function createFinancialReport(formData: z.infer<typeof financialReportSchema>) {
  const result = financialReportSchema.safeParse(formData);
  if (!result.success) return { success: false, error: "Validation failed" };

  try {
    // Create report
    await prisma.financialReport.create({
      data: {
        userId: result.data.artistId,
        quarter: result.data.quarter,
        title: result.data.title,
        amount: result.data.amount,
        fileUrl: result.data.fileData, // Base64
        linkUrl: result.data.linkUrl
      }
    });

    // Update user balance
    await prisma.user.update({
      where: { id: result.data.artistId },
      data: { balance: { increment: result.data.amount } }
    });

    // Notify
    await createNotification(
      result.data.artistId,
      'FINANCE',
      'Финансовый отчет',
      `Доступен новый финансовый отчет: ${result.data.title}. Сумма: ${result.data.amount} ₽`,
      '/finance'
    );

    revalidatePath("/admin/finance");
    return { success: true };
  } catch (error) {
    console.error("Create finance report error:", error);
    return { success: false, error: "Failed" };
  }
}

export async function getFinancialReports() {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return [];

  try {
    return await prisma.financialReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

export async function getAllFinancialReports() {
  try {
    return await prisma.financialReport.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

export async function requestPayout(formData: z.infer<typeof payoutRequestSchema>) {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return { success: false, error: "Unauthorized" };

  const result = payoutRequestSchema.safeParse(formData);
  if (!result.success) return { success: false, error: "Validation failed" };

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.balance || 0) < result.data.amount) {
      return { success: false, error: "Insufficient funds" };
    }

    await prisma.payoutRequest.create({
      data: {
        userId,
        amount: result.data.amount,
        method: result.data.method,
        details: result.data.details
      }
    });

    // We don't deduct balance yet, only on approval? 
    // Or we deduct now to "lock" it? 
    // Let's deduct now to prevent double spend.
    await prisma.user.update({
      where: { id: userId },
      data: { balance: { decrement: result.data.amount } }
    });

    revalidatePath("/finance");
    return { success: true };
  } catch (error) {
    console.error("Payout request error:", error);
    return { success: false, error: "Failed" };
  }
}

export async function getPayouts() {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return [];

  try {
    return await prisma.payoutRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

// Admin Payout Actions
export async function getPendingPayouts() {
  try {
    return await prisma.payoutRequest.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

export async function getAllPayouts() {
  try {
    return await prisma.payoutRequest.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

export async function approvePayout(id: string) {
  try {
    await prisma.payoutRequest.update({
      where: { id },
      data: { status: "PAID" }
    });
    
    // Notify
    const request = await prisma.payoutRequest.findUnique({ where: { id } });
    if (request) {
      await createNotification(
        request.userId,
        'FINANCE',
        'Выплата одобрена',
        `Ваш запрос на вывод ${request.amount} ₽ успешно обработан.`,
        '/finance'
      );

      // Email Notification
      const user = await prisma.user.findUnique({ where: { id: request.userId } });
      if (user) {
        try {
          await sendPayoutStatusEmail(user.email, user.name, request.amount, 'PAID');
        } catch (emailError) {
          console.error("Failed to send payout email:", emailError);
        }
      }
    }

    revalidatePath("/admin/finance");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed" };
  }
}

// --- Smart Link Actions ---

export async function updateSmartLink(releaseId: string, links: Record<string, string>) {
  try {
    // Generate slug if not exists
    const release = await prisma.release.findUnique({ where: { id: releaseId } });
    let slug = release?.smartLinkSlug;
    
    if (!slug && release) {
      slug = release.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(7);
    }

    await prisma.release.update({
      where: { id: releaseId },
      data: {
        smartLinkSlug: slug,
        platformLinks: JSON.stringify(links)
      }
    });
    
    revalidatePath(`/tools/smart-links/${releaseId}`);
    return { success: true, slug };
  } catch (error) {
    console.error("Update smart link error:", error);
    return { success: false, error: "Failed" };
  }
}

export async function getSmartLink(slug: string) {
  try {
    return await prisma.release.findUnique({
      where: { smartLinkSlug: slug },
      include: { artist: true }
    });
  } catch (error) {
    return null;
  }
}

export async function searchLinks(query: string) {
  try {
    const response = await fetch(`https://api.song.link/v1-alpha.1/links?userCountry=US&songIfNoneFound=true&q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.linksByPlatform || null;
  } catch (error) {
    console.error("Search links error:", error);
    return null;
  }
}

// --- Artist Card Actions ---

export async function createArtistRequest(data: {
  type: string;
  platform?: string;
  description: string;
  attachmentUrl?: string;
  artistCardLink?: string;
}) {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return { success: false, error: "Unauthorized" };

  try {
    const request = await prisma.artistRequest.create({
      data: {
        userId,
        type: data.type,
        platform: data.platform,
        description: data.description,
        attachmentUrl: data.attachmentUrl,
        artistCardLink: data.artistCardLink
      },
      include: { user: true }
    });

    // Notify Admins
    await notifyAdmins(
      'REQUEST',
      'Новый запрос',
      `Пользователь ${request.user.name} создал запрос: ${data.type}`,
      '/admin/requests'
    );

    return { success: true };
  } catch (error) {
    console.error("Create request error:", error);
    return { success: false, error: "Failed to create request" };
  }
}

export async function getArtistRequests() {
  const userId = cookies().get("user_id")?.value;
  if (!userId) return [];

  try {
    return await prisma.artistRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    return [];
  }
}

export async function getAllArtistRequests() {
  try {
    const requests = await prisma.artistRequest.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    // Sort by tariff (PREMIUM first)
    return requests.sort((a, b) => {
      if (a.user.tariff === 'PREMIUM' && b.user.tariff !== 'PREMIUM') return -1;
      if (a.user.tariff !== 'PREMIUM' && b.user.tariff === 'PREMIUM') return 1;
      return 0;
    });
  } catch (error) {
    return [];
  }
}

export async function updateArtistRequestStatus(id: string, status: string) {
  try {
    const request = await prisma.artistRequest.update({
      where: { id },
      data: { status },
      include: { user: true }
    });

    // Notify User
    if (status === 'DONE') {
      await createNotification(
        request.userId,
        'REQUEST_DONE',
        'Запрос выполнен',
        `Ваш запрос "${request.type}" был успешно выполнен!`,
        '/tools/artist-card'
      );
      // Email Notification
      try {
        await sendRequestStatusEmail(request.user.email, request.user.name, request.type, 'DONE');
      } catch (emailError) {
        console.error("Failed to send request done email:", emailError);
      }
    } else if (status === 'REJECTED') {
      await createNotification(
        request.userId,
        'REQUEST_REJECTED',
        'Запрос отклонен',
        `Ваш запрос "${request.type}" был отклонен.`,
        '/tools/artist-card'
      );
      // Email Notification
      try {
        await sendRequestStatusEmail(request.user.email, request.user.name, request.type, 'REJECTED');
      } catch (emailError) {
        console.error("Failed to send request rejected email:", emailError);
      }
    }

    revalidatePath("/admin/requests");
    revalidatePath("/tools/artist-card");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed" };
  }
}

// --- Scanner Actions ---

export async function scanReleasePlaylists(query: string) {
  try {
    let searchQuery = query;

    // Check if it's an internal Release ID (UUID-like)
    if (query.length > 20 && !query.includes(' ')) {
      const release = await prisma.release.findUnique({ where: { id: query } });
      if (release) {
        searchQuery = `${release.mainArtist} - ${release.title}`;
        if (release.upc) searchQuery = release.upc;
      }
    }

    // Use Odesli API (Real Data)
    // We reuse searchLinks logic but formatted for scanner
    const response = await fetch(`https://api.song.link/v1-alpha.1/links?userCountry=US&songIfNoneFound=true&q=${encodeURIComponent(searchQuery)}`);
    const data = await response.json();

    if (!data || !data.linksByPlatform) {
      return { success: true, data: [] };
    }

    const links = data.linksByPlatform;
    const platforms = [
      { name: "Apple Music", icon: "apple-music", playlists: [], link: links.appleMusic?.url },
      { name: "Spotify", icon: "spotify", playlists: [], link: links.spotify?.url },
      { name: "VK Music", icon: "vk-music", playlists: [], link: links.yandex?.url }, // Odesli might not have VK, mapping Yandex as fallback or check if they support VK (yandex is yandex)
      { name: "Yandex Music", icon: "yandex-music", playlists: [], link: links.yandex?.url },
      { name: "YouTube Music", icon: "youtube-music", playlists: [], link: links.youtubeMusic?.url },
      { name: "Deezer", icon: "deezer", playlists: [], link: links.deezer?.url },
    ];

    // Note: To get REAL editorial playlists, we would need:
    // 1. Spotify Client ID/Secret (for Spotify API)
    // 2. Apple Music Developer Token (for Apple Music API)
    // Since we don't have these, we return the direct links found by Odesli.
    // We add a 'status' to indicate if it was found on the platform.

    return { success: true, data: platforms.filter(p => p.link) };

  } catch (error) {
    console.error("Scan error:", error);
    return { success: false, error: "Scan failed" };
  }
}