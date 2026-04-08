import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Upload,
  FileText,
  ChevronRight,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { ErrorBanner } from "../components/ErrorBanner";
import { ProgressStepper } from "../components/ProgressStepper";
import { StepGuide } from "../components/StepGuide";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Point pdf.js worker at the CDN so we don't need a local worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [uploadMethod, setUploadMethod] = useState<"upload" | "paste">("upload");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const dragCounterRef = useRef(0); // tracks nested drag-enter/leave events
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Validation ────────────────────────────────────────────────────────────
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE)
      return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max size is 10 MB.`;
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext))
      return "Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file.";
    if (file.size === 0)
      return "This file is empty. Please upload a valid resume file.";
    return null;
  };

  // ─── PDF extraction ────────────────────────────────────────────────────────
  const extractPDF = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      pages.push(pageText);
    }
    return pages.join("\n");
  };

  // ─── DOCX extraction ───────────────────────────────────────────────────────
  const extractDOCX = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  // ─── Core file processor ──────────────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    setError("");
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      let text = "";

      if (ext === ".txt") {
        text = await file.text();
      } else if (ext === ".pdf") {
        const buffer = await file.arrayBuffer();
        text = await extractPDF(buffer);
      } else if (ext === ".doc" || ext === ".docx") {
        const buffer = await file.arrayBuffer();
        text = await extractDOCX(buffer);
      }

      text = text.trim();

      if (!text || text.length === 0) {
        setError("No readable text found in this file. Try the Paste Text option instead.");
        setFileName("");
        return;
      }
      if (text.length < 50) {
        setError("The file seems too short to be a complete resume. Please check and re-upload.");
        setFileName("");
        return;
      }

      setResumeText(text);
    } catch (err) {
      console.error("File processing error:", err);
      setError(
        "Could not read this file. Please try again or paste your resume text directly."
      );
      setFileName("");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // ─── Click-to-upload ───────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  // ─── Drag & drop (counter-based to avoid child-element flicker) ────────────
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText.trim()) return;
    localStorage.setItem("resumeContent", resumeText);
    navigate("/ai-analysis");
  };

  const clearFile = () => {
    setFileName("");
    setResumeText("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <AppHeader back={{ label: "Back", to: "/onboarding" }} />
      <ProgressStepper currentStep={2} />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <StepGuide
            storageKey="resume-upload"
            title="Step 2 of 5 — Upload Your Resume"
            steps={[
              "Choose 'Upload File' to drag & drop or browse for a PDF, DOCX, DOC, or TXT file — we extract the text automatically.",
              "Or choose 'Paste Text' and copy-paste your resume content directly into the text box.",
              "Once your file is loaded (you'll see a green checkmark), click 'Analyze My Resume' to continue.",
            ]}
            next="The AI will spend about 10 seconds checking your resume across 5 scoring categories."
            tip="If your PDF produces garbled text, use the Paste Text tab instead — copy from your PDF viewer and paste here."
          />

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8">
            {/* Title */}
            <div className="mb-7">
              <h2 className="text-gray-900 dark:text-gray-100 mb-1">Upload Your Resume</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drop your file anywhere in the box, click to browse, or paste your text. Supports <strong>PDF, DOCX, DOC, and TXT</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Banner */}
              {error && (
                <ErrorBanner
                  title="Upload Error"
                  message={error}
                  actionLabel="Try Again"
                  onAction={() => setError("")}
                  onDismiss={() => setError("")}
                />
              )}

              {/* Tab Toggle */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setUploadMethod("upload"); clearFile(); }}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-all text-sm font-medium flex flex-col items-center gap-1 ${
                    uploadMethod === "upload"
                      ? "bg-blue-50 dark:bg-blue-950 border-blue-500 dark:border-blue-500 text-blue-700 dark:text-blue-300"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => { setUploadMethod("paste"); clearFile(); }}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-all text-sm font-medium flex flex-col items-center gap-1 ${
                    uploadMethod === "paste"
                      ? "bg-blue-50 dark:bg-blue-950 border-blue-500 dark:border-blue-500 text-blue-700 dark:text-blue-300"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Paste Text
                </button>
              </div>

              {/* Upload Tab */}
              {uploadMethod === "upload" && (
                <>
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleFileChange} />

                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer select-none ${
                      isDragging
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : fileName && !error
                        ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-500"
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reading your resume</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{fileName}</p>
                      </div>
                    ) : fileName && resumeText ? (
                      <div className="flex flex-col items-center gap-3">
                        <CheckCircle2 className="w-10 h-10 text-green-500 dark:text-green-400" />
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">Resume ready</p>
                        <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 px-3 py-1.5 rounded-lg">
                          <FileText className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                          <span className="text-sm text-green-700 dark:text-green-300 truncate max-w-xs">{fileName}</span>
                          <button type="button" onClick={(e) => { e.stopPropagation(); clearFile(); }}
                            className="ml-1 text-green-500 hover:text-red-500 transition-colors" aria-label="Remove file">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Click or drag a new file to replace</p>
                      </div>
                    ) : (
                      <>
                        <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragging ? "text-blue-500" : "text-gray-300 dark:text-gray-600"}`} />
                        {isDragging ? (
                          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Drop it here</p>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="text-blue-600 dark:text-blue-400 font-medium">Click to browse</span>
                              {" or drag and drop your file here"}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">PDF, DOCX, DOC, TXT — up to 10 MB</p>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {resumeText && fileName.endsWith(".txt") && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Preview</p>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
                        <pre className="text-xs whitespace-pre-wrap font-mono text-gray-600 dark:text-gray-400">
                          {resumeText.slice(0, 800)}{resumeText.length > 800 ? "…" : ""}
                        </pre>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{resumeText.length.toLocaleString()} characters extracted</p>
                    </div>
                  )}
                </>
              )}

              {/* Paste Tab */}
              {uploadMethod === "paste" && (
                <div>
                  <label htmlFor="resume-text" className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                    Paste your resume content below
                  </label>
                  <textarea
                    id="resume-text"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={14}
                    placeholder="Paste your full resume text here"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-y bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{resumeText.length.toLocaleString()} characters</p>
                </div>
              )}

              {/* Tips */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tips for the best results</h4>
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <li>Include all your experience, internships, and projects</li>
                  <li>List the specific tools and programming languages you know</li>
                  <li>Add numbers to your achievements (e.g., "helped 50+ students")</li>
                  <li>If your PDF looks garbled, use the Paste Text tab instead</li>
                </ul>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => navigate("/onboarding")}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-4 py-2 font-medium transition-colors">
                  Back
                </button>
                <button type="submit" disabled={!resumeText.trim() || isProcessing}
                  className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-7 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processing</>
                  ) : (
                    <>Analyze My Resume <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}