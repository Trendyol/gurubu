"use client";
import { NextPage } from "next";
import React from "react";
import JiraPdfDownloader from "./components/JiraPdfDownloader";
import { ToastProvider } from "@/contexts/ToastContext";
import { LoaderProvider } from "@/contexts/LoaderContext";

const JiraPdfPage: NextPage = () => {
  return (
    <div className="jira-pdf-page">
      <ToastProvider>
        <LoaderProvider>
          <div className="jira-pdf-container">
            <h1>Jira Board PDF Report</h1>
            <p>
              Select a Jira board and download a comprehensive report of all issues with their initial and current story points.
            </p>
            <JiraPdfDownloader />
          </div>
        </LoaderProvider>
      </ToastProvider>
    </div>
  );
};

export default JiraPdfPage; 