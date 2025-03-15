"use client";
import React, { useState } from "react";
import { JiraService } from "@/services/jiraService";
import { useToast } from "@/contexts/ToastContext";
import { useLoader } from "@/contexts/LoaderContext";
import debounce from "lodash.debounce";
import axios from "axios";

const JiraPdfDownloader: React.FC = () => {
  const [boardSearch, setBoardSearch] = useState<string>("");
  const [selectedBoard, setSelectedBoard] = useState<string>("");
  const [boards, setBoards] = useState<{ id: string; name: string }[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const { showSuccessToast, showFailureToast } = useToast();
  const { setShowLoader } = useLoader();
  
  const jiraService = new JiraService(process.env.NEXT_PUBLIC_API_URL || "");
  
  const handleBoardSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const board = e.target.value.trim();
    setBoardSearch(board);
    setSelectedBoard("");
    setBoards([]);
    
    if (board) {
      debouncedSearchBoards(board);
    }
  };
  
  const debouncedSearchBoards = React.useCallback(
    debounce((searchQuery: string) => {
      fetchBoards(searchQuery);
    }, 500),
    []
  );
  
  const handleBoardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBoard(e.target.value);
  };
  
  const fetchBoards = async (searchQuery: string) => {
    setShowLoader(true);
    try {
      const response = await jiraService.searchBoards(searchQuery);
      if (response.isSuccess && response.data) {
        showSuccessToast(
          "Jira Boards Found",
          "Select a board to download the PDF report",
          "top-center"
        );
        setBoards(response.data);
      } else {
        showFailureToast(
          "Search Board Error",
          "Try a different board name",
          "top-center"
        );
      }
    } catch (error) {
      showFailureToast(
        "Search Board Error",
        "An error occurred while searching for boards",
        "top-center"
      );
    } finally {
      setShowLoader(false);
    }
  };
  
  const handleDownloadPdf = async () => {
    if (!selectedBoard) {
      showFailureToast(
        "Board Required",
        "Please select a board first",
        "top-center"
      );
      return;
    }
    
    try {
      setIsDownloading(true);
      setProgress(10);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const downloadUrl = `${apiUrl}/jira-pdf-creator/${selectedBoard}/download-pdf`;
      
      const response = await axios({
        url: downloadUrl,
        method: 'GET',
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          } else {
            setProgress((prevProgress) => {
              return prevProgress < 90 ? prevProgress + 5 : prevProgress;
            });
          }
        }
      });
      
      if (response.status === 200) {
        setProgress(100);
        
        const blob = new Blob([response.data], { type: "application/pdf" });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        
        const date = new Date();
        const formattedDate = date.toISOString().split("T")[0];
        const formattedTime = date.toTimeString().split(" ")[0].replace(/:/g, "");
        
        const boardName = boards.find(board => board.id === selectedBoard)?.name || selectedBoard;
        link.download = `jira_board_${boardName}_report_${formattedDate}_${formattedTime}.pdf`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccessToast(
          "Download Complete",
          "PDF report has been downloaded successfully",
          "top-center"
        );
        
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          setIsDownloading(false);
          setProgress(0);
        }, 2000);
      }
    } catch (error) {
      let errorMessage = "Unknown error occurred";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      handleDownloadError(errorMessage);
    }
  };
  
  const handleDownloadError = (errorMessage: string) => {
    setIsDownloading(false);
    setProgress(0);
    showFailureToast(
      "Download Failed",
      `Error: ${errorMessage}. Please try again.`,
      "top-center"
    );
  };
  
  const handleClearForm = () => {
    setBoardSearch("");
    setSelectedBoard("");
    setBoards([]);
    setProgress(0);
  };
  
  return (
    <div className="jira-pdf-form">
      <div className="form-row">
        <label htmlFor="boardSearch">Search for a Jira Board</label>
        <input
          id="boardSearch"
          name="boardSearch"
          placeholder="Enter your board name (e.g., SFWC, SFWD)"
          onChange={handleBoardSearchChange}
          value={boardSearch}
          disabled={isDownloading}
        />
      </div>
      
      <div className="form-row">
        <label htmlFor="board">Select a Board</label>
        <select
          id="board"
          name="board"
          onChange={handleBoardChange}
          value={selectedBoard}
          disabled={!boards.length || isDownloading}
        >
          <option value="">-- Select Board --</option>
          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              {board.name}
            </option>
          ))}
        </select>
      </div>
      
      {isDownloading && (
        <div className="progress-container">
          <div className="progress-label">
            <span>Downloading PDF...</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      <div className="buttons">
        <button
          type="button"
          className="primary"
          onClick={handleDownloadPdf}
          disabled={!selectedBoard || isDownloading}
        >
          {isDownloading ? "Downloading..." : "Download PDF"}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={handleClearForm}
          disabled={isDownloading}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default JiraPdfDownloader; 