import { getArtistAnalytics, getCurrentUser } from "@/app/actions";
import AnalyticsDashboard from "./AnalyticsDashboard";

export default async function AnalyticsPage() {
  const [reports, user] = await Promise.all([
    getArtistAnalytics(),
    getCurrentUser()
  ]);

  return <AnalyticsDashboard reports={reports} user={user} />;
}