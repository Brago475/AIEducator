import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import * as THREE from "three";
import {
  GraduationCap, ArrowRight, Sparkles,
  FileText, Cpu, Building2,
  Sun, Moon, CheckCircle, Quote,
} from "lucide-react";

// ─── Three.js scene ──────────────────────────────────────────────────────────
function useThreeScene(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x030712, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 28);

    // ── Globe wireframe ────────────────────────────────────────────────
    const globeGeo = new THREE.SphereGeometry(8, 40, 40);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0x1e40af,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    // Inner glow sphere
    const glowGeo = new THREE.SphereGeometry(7.8, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x1d4ed8,
      transparent: true,
      opacity: 0.04,
    });
    scene.add(new THREE.Mesh(glowGeo, glowMat));

    // ── Latitude/longitude grid rings ──────────────────────────────────
    const ringMat = new THREE.LineBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.08 });
    for (let i = 1; i < 6; i++) {
      const lat = (i / 6) * Math.PI;
      const r = 8 * Math.sin(lat);
      const y = 8 * Math.cos(lat);
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 64; j++) {
        const a = (j / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(r * Math.cos(a), y, r * Math.sin(a)));
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      scene.add(new THREE.Line(lineGeo, ringMat));
    }

    // ── City points on globe ───────────────────────────────────────────
    const cities = [
      { lat: 40.7, lon: -74.0, name: "New York" },
      { lat: 51.5, lon: -0.1, name: "London" },
      { lat: 35.7, lon: 139.7, name: "Tokyo" },
      { lat: -33.9, lon: 18.4, name: "Cape Town" },
      { lat: 22.3, lon: 114.2, name: "Hong Kong" },
      { lat: 48.9, lon: 2.35, name: "Paris" },
      { lat: -23.6, lon: -46.6, name: "São Paulo" },
      { lat: 1.35, lon: 103.8, name: "Singapore" },
      { lat: 37.8, lon: -122.4, name: "San Francisco" },
      { lat: 55.8, lon: 37.6, name: "Moscow" },
      { lat: 19.4, lon: -99.1, name: "Mexico City" },
      { lat: -33.9, lon: 151.2, name: "Sydney" },
      { lat: 28.6, lon: 77.2, name: "Delhi" },
      { lat: 25.3, lon: 55.3, name: "Dubai" },
      { lat: 39.9, lon: 116.4, name: "Beijing" },
    ];

    function latLonToVec3(lat: number, lon: number, r: number): THREE.Vector3 {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    // City dots
    const dotGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });
    const cityPositions: THREE.Vector3[] = [];

    cities.forEach((city) => {
      const pos = latLonToVec3(city.lat, city.lon, 8.05);
      cityPositions.push(pos);
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      globe.add(dot);

      // Pulse ring
      const ringGeo = new THREE.RingGeometry(0.15, 0.25, 16);
      const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat2);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      globe.add(ring);
    });

    // ── Connection arcs between cities ─────────────────────────────────
    const arcMat = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.25 });
    const connections = [
      [0, 1], [0, 8], [1, 5], [1, 9], [2, 4], [2, 7],
      [3, 13], [4, 14], [5, 12], [6, 10], [7, 11],
      [8, 10], [9, 14], [11, 2], [12, 13], [0, 6],
    ];

    connections.forEach(([a, b]) => {
      const start = cityPositions[a];
      const end = cityPositions[b];
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      mid.normalize().multiplyScalar(8 + start.distanceTo(end) * 0.3);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const pts = curve.getPoints(40);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(pts);
      globe.add(new THREE.Line(arcGeo, arcMat));
    });

    // ── Floating particles around globe ────────────────────────────────
    const PARTICLE_COUNT = 2000;
    const pPositions = new Float32Array(PARTICLE_COUNT * 3);
    const pColors = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 10 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);
      const t = Math.random();
      pColors[i * 3] = t < 0.5 ? 0.4 + Math.random() * 0.3 : 0.8 + Math.random() * 0.2;
      pColors[i * 3 + 1] = t < 0.5 ? 0.5 + Math.random() * 0.3 : 0.9 + Math.random() * 0.1;
      pColors[i * 3 + 2] = 1;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pColors, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.6, sizeAttenuation: true });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Mouse tracking ─────────────────────────────────────────────────
    let targetX = 0, targetY = 0;
    const onMM = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 4;
      targetY = (e.clientY / window.innerHeight - 0.5) * 3;
    };
    window.addEventListener("mousemove", onMM);

    const onResize = () => {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ─────────────────────────────────────────────────
    let animId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Slow globe rotation
      globe.rotation.y = t * 0.08;
      globe.rotation.x = Math.sin(t * 0.02) * 0.1;

      // Particles drift
      particles.rotation.y = t * 0.015;
      particles.rotation.x = Math.sin(t * 0.01) * 0.05;

      // Smooth camera parallax
      camera.position.x += (targetX - camera.position.x) * 0.03;
      camera.position.y += (-targetY - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, [canvasRef]);
}

// ─── Scroll reveal hook ──────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.opacity = "1";
            (e.target as HTMLElement).style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateY(32px)";
      (el as HTMLElement).style.transition = "opacity 0.65s ease, transform 0.65s ease";
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);
}

// ─── Testimonials ────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Meeraben Patel", quote: "The most helpful part of the prototype was the personalized career recommendations, as they made it easier to identify relevant job opportunities based on my skills and interests." },
  { name: "Brodie Berger", quote: "I think the layout and presentation was nice. I could find everything I needed to with a maximum of 2 clicks." },
  { name: "Meeraben Patel", quote: "I liked the clean and intuitive interface of the prototype. It reduces complexity and makes it easy for users to quickly find matches and schedule meetings without confusion." },
  { name: "Iyadunni Adenuga", quote: "The resume analyzer and career suggestions were the most helpful features." },
  { name: "Md Jonayed Hossain Chowdhury", quote: "The Resume Analysis feature stood out as particularly useful." },
  { name: "Travis Matos", quote: "I like how it asks to insert your resume — it makes the process straightforward." },
  { name: "Akhil Ageer", quote: "The UI and UX were the most impressive parts of the prototype." },
];

// ─── CSS for animations (injected once) ──────────────────────────────────────
const ANIM_STYLES = `
  @keyframes sealSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes sealFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes kenBurns { 0% { transform: scale(1); } 50% { transform: scale(1.08); } 100% { transform: scale(1); } }
  @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 20px rgba(37,99,235,0.2); } 50% { box-shadow: 0 0 40px rgba(37,99,235,0.5); } }
  .seal-float { animation: sealFloat 4s ease-in-out infinite; }
  .seal-spin-slow { animation: sealSpin 30s linear infinite; }
  .ken-burns { animation: kenBurns 20s ease-in-out infinite; }
  .fade-slide-up { animation: fadeSlideUp 1s ease-out forwards; }
  .fade-slide-up-d1 { animation: fadeSlideUp 1s ease-out 0.2s forwards; opacity: 0; }
  .fade-slide-up-d2 { animation: fadeSlideUp 1s ease-out 0.4s forwards; opacity: 0; }
  .pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useThreeScene(canvasRef);
  useScrollReveal();

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <div className="bg-white dark:bg-gray-950">
      <style>{ANIM_STYLES}</style>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative h-screen overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: "block" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70 pointer-events-none" />

        <nav className="absolute top-0 left-0 right-0 z-20 px-6 sm:px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/Images/kean-logo.png" alt="Kean" className="w-8 h-8 seal-spin-slow rounded-full bg-white p-0.5" />
            <span className="text-white font-bold text-lg tracking-tight">
              Kean <span className="text-blue-400">AIEducator</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors" aria-label="Toggle theme">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => navigate("/employers")} className="text-white/80 hover:text-white text-sm font-medium transition-colors px-3 py-1.5">
              For Employers
            </button>
            <button onClick={() => navigate("/login")} className="text-white/80 hover:text-white text-sm font-medium transition-colors px-3 py-1.5">
              Sign In
            </button>
            <button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
              Get Started
            </button>
          </div>
        </nav>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
          {/* Animated seal */}
          <div className="seal-float mb-6">
            <div className="pulse-glow rounded-full">
              <img src="/Images/kean-seal.png" alt="Kean University Seal" className="w-24 h-24 rounded-full border-2 border-white/20 bg-white p-1" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-semibold px-4 py-2 rounded-full mb-6 backdrop-blur-sm fade-slide-up">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Career Platform · Kean University
          </div>

          <h1 className="text-white max-w-3xl mx-auto mb-5 fade-slide-up-d1" style={{ fontSize: "clamp(2.4rem, 6vw, 4.2rem)", lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Your Career Journey{" "}
            <span style={{ background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Starts Here
            </span>
          </h1>

          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8 leading-relaxed fade-slide-up-d2">
            AI-powered resume analysis, career matching, and employer connections.Built for Kean students.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 fade-slide-up-d2">
            <button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all hover:scale-105 active:scale-100 flex items-center gap-2 shadow-lg shadow-blue-600/30">
              I'm a Student <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => navigate("/employers")} className="border border-white/30 hover:border-white/60 text-white/90 hover:text-white font-semibold px-8 py-4 rounded-xl text-base transition-all backdrop-blur-sm">
              I'm an Employer
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {["Free for students", "Results in 30s", "Employer matching"].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-white/60 text-xs">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CAMPUS SHOWCASE ──────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Image with Ken Burns */}
            <div data-reveal className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <img
                src="/Images/kean-building.png"
                alt="Kean University Campus"
                className="w-full h-80 object-cover ken-burns"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <img src="/Images/kean-logo.png" alt="Kean University" className="h-8 opacity-90" />
                <p className="text-white/80 text-xs mt-2">Union, New Jersey · Est. 1855</p>
              </div>
            </div>

            {/* Text */}
            <div data-reveal>
              <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                Built for Kean
              </div>
              <h2 className="text-gray-900 dark:text-gray-100 mb-4" style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 700 }}>
                Designed Around Our Students
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                AIEducator was built specifically for Kean University students. Our AI understands the programs, career paths, and employer connections that matter most to our community.
              </p>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">16,000+</div>
                  <div className="text-xs text-gray-500">Students</div>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50+</div>
                  <div className="text-xs text-gray-500">Programs</div>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-gray-700" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">1855</div>
                  <div className="text-xs text-gray-500">Established</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THREE PILLARS ────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16" data-reveal>
            <h2 className="text-gray-900 dark:text-gray-100 mb-3" style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 700 }}>
              One Platform, Two Sides
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
              Students get AI-powered career tools. Employers find pre-matched talent. Everyone wins.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <FileText className="w-6 h-6" />, title: "Resume Intelligence", desc: "Upload your resume and get a detailed AI analysis with scores, rewrites, and missing keywords — specific to your field.", color: "blue" },
              { icon: <Cpu className="w-6 h-6" />, title: "Career Matching", desc: "Discover career paths ranked by your skills, interests, and market demand. With salary data and growth projections.", color: "purple" },
              { icon: <Building2 className="w-6 h-6" />, title: "Employer Portal", desc: "Employers browse pre-matched student profiles, post opportunities, and connect with talent that fits.", color: "emerald" },
            ].map((item, i) => (
              <div key={i} data-reveal style={{ transitionDelay: `${i * 100}ms` }} className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 hover:border-blue-300 dark:hover:border-blue-600 transition-all hover:shadow-lg">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                  item.color === "blue" ? "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400" :
                  item.color === "purple" ? "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400" :
                  "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                }`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STUDENT TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14" data-reveal>
            <h2 className="text-gray-900 dark:text-gray-100 mb-3" style={{ fontSize: "clamp(1.6rem, 4vw, 2.5rem)", fontWeight: 700 }}>
              What Kean Students Are Saying
            </h2>
            <p className="text-gray-600 dark:text-gray-400">Real feedback from students who tested the prototype.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.slice(0, 6).map((t, i) => (
              <div key={i} data-reveal style={{ transitionDelay: `${i * 80}ms` }} className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                <Quote className="w-5 h-5 text-blue-400 mb-3" />
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Kean University Student</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10" data-reveal>
          {/* Seal in CTA */}
          <img src="/Images/kean-seal.png" alt="" className="w-16 h-16 mx-auto mb-6 opacity-30 seal-spin-slow rounded-full bg-white/30 p-1" />

          <h2 className="text-white mb-4" style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 700 }}>
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 mb-8">
            Whether you're a student looking for guidance or an employer seeking talent.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-105 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> Student Sign Up
            </button>
            <button onClick={() => navigate("/employers")} className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Employer Portal
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 border-t border-gray-800 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/Images/kean-logo.png" alt="" className="w-5 h-5 rounded-full bg-white p-0.5" />
            <span className="text-white font-semibold">Kean AIEducator</span>
          </div>
          <p className="text-gray-500 text-sm">Kean University · Union, New Jersey</p>
          <div className="flex items-center gap-4 text-sm">
            <button onClick={() => navigate("/help")} className="text-gray-500 hover:text-gray-300 transition-colors">Help</button>
            <button onClick={() => navigate("/login")} className="text-gray-500 hover:text-gray-300 transition-colors">Sign In</button>
            <button onClick={() => navigate("/employers")} className="text-gray-500 hover:text-gray-300 transition-colors">Employers</button>
          </div>
        </div>
      </footer>
    </div>
  );
}