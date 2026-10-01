// Vercel serverless function: /api/studyiq?courseId=123
// Keeps the StudyIQ token on the server (set STUDYIQ_TOKEN in Vercel -> Settings -> Environment Variables).

const ENDPOINTS = (id) => [
  `https://backend.studyiq.net/app-content-ws/v2/course/getDetails?courseId=${id}`,
  `https://backend.studyiq.net/app-content-ws/v1/course/content?courseId=${id}`,
  `https://backend.studyiq.net/app-content-ws/course/lectures?courseId=${id}`
];

async function fetchWithTimeout(url, options, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const courseId = String((req.query && req.query.courseId) || (req.body && req.body.courseId) || "").trim();
  if (!/^\d{1,9}$/.test(courseId)) {
    return res.status(400).json({ success: false, error: "Invalid course id" });
  }

  const headers = {
    Accept: "application/json, text/plain, */*",
    Platform: "WEB",
    Authorization: process.env.STUDYIQ_TOKEN || "",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Referer: "https://www.studyiq.com/",
    Origin: "https://www.studyiq.com"
  };

  for (const url of ENDPOINTS(courseId)) {
    try {
      const upstream = await fetchWithTimeout(url, { headers }, 15000);
      if (!upstream.ok) continue;
      const data = await upstream.json();
      if (data && (data.data || data.courseContent || data.lectures)) {
        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
        return res.status(200).json({ success: true, data });
      }
    } catch (e) {
      continue;
    }
  }

  return res.status(404).json({
    success: false,
    error: "Content not found or token expired",
    tokenConfigured: Boolean(process.env.STUDYIQ_TOKEN)
  });
};
