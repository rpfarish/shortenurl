// App.tsx
import "./App.css";
import UrlInterface from "./Interface";
// import FirebaseExample from "./FirebaseExample";

import { getDoc, doc } from "firebase/firestore";

import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import db from "./firebase";

/* ---------- HOME ---------- */
function Home() {
  console.log("Reloaded Home");

  return (
    <>
      <h1>URL Shortener:</h1>
      <UrlInterface />
      {/* <FirebaseExample /> */}
    </>
  );
}

const dbName = "shortenedUrls";
/* ---------- SLUG REDIRECT ---------- */
async function resolveSlug(slug: string): Promise<string | null> {
  // 🔑 Replace this with your DB lookup (Firestore, Supabase, etc.)
  // For example, Firestore:
  //
  const snap = await getDoc(doc(db, dbName, slug));
  return snap.exists() ? snap.data().linkUrl : null;
}

function RedirectSlug() {
  const { slug } = useParams(); // "/YzmupSH" → { slug: "YzmupSH" }
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;

    (async () => {
      try {
        const longUrl = await resolveSlug(slug);
        longUrl
          ? window.location.replace(longUrl) // hard redirect
          : navigate("/", { replace: true }); // unknown slug → home
      } catch (err) {
        console.error("Redirect failed:", err);
        navigate("/", { replace: true });
      }
    })();
  }, [slug, navigate]);

  return <p>Redirecting…</p>;
}

/* ---------- ROUTER SHELL ---------- */
export default function App() {
  return (
    <Routes>
      <Route path="shortenurl/" element={<Home />} />
      <Route path="shortenurl/:slug" element={<RedirectSlug />} />
      <Route path="shortenurl/*" element={<Home />} /> {/* fallback / 404 */}
    </Routes>
  );
}
