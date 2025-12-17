import { getNews, getArtistReleases, getCurrentUser } from "@/app/actions";
import DashboardContent from "./DashboardContent";

export default async function Home() {
  const [news, releases, user] = await Promise.all([
    getNews(),
    getArtistReleases(),
    getCurrentUser()
  ]);

  return <DashboardContent news={news} releases={releases} user={user} />;
}