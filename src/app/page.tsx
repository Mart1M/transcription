"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    return data.text;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setTranscription("");
    setProgress(0);

    try {
      const fullTranscription = await uploadFile(file);
      setTranscription(fullTranscription.trim());
      setProgress(100);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Audio Transcription App</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          disabled={!file || isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
        >
          {isLoading ? "Transcribing..." : "Transcribe Audio"}
        </button>
      </form>
      {isLoading && (
        <div className="mt-4 w-full max-w-md">
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center mt-2">{progress}% completed</p>
        </div>
      )}
      {transcription && (
        <div className="mt-8 w-full">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Transcription:</h2>
            <button
              onClick={copyToClipboard}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {isCopied ? "Copied !" : "Copy"}
            </button>
          </div>
          <p className="p-4 bg-gray-100 rounded">{transcription}</p>
        </div>
      )}
    </div>
  );
}
