import React, { useState, useRef, useEffect } from "react";
import { Box, Paper, Typography, Link, Modal, TextField, Button, CircularProgress } from "@mui/material";
import { Document, Page } from "react-pdf";
import ReactMarkdown from "react-markdown";
import { sendMessage } from "../services/chatService";
import ErrorBoundary from "./ErrorBoundary";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [pdfLink, setPdfLink] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleOpenModal = (link) => {
    console.log(link);
    setPdfLink(link);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;
    sendMessage(inputMessage, setMessages, setIsLoading, setIsTyping);
    setInputMessage("");
  };

  return (
    <ErrorBoundary>
      <Paper
        elevation={3}
        sx={{
          padding: "20px",
          maxWidth: "600px",
          margin: "20px auto",
          borderRadius: "15px",
          boxShadow: 3,
        }}
      >
        <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: "bold" }}>
          Interactive FAQ Chatbot with PDF Search
        </Typography>

        {/* Chat Window */}
        <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "10px",
            maxHeight: "400px",
            overflowY: "scroll",
            marginBottom: "20px",
            backgroundColor: "#f9f9f9",
          }}
        >
          {messages.length === 0 ? (
            <Typography variant="body2" align="center" sx={{ color: "#888", marginTop: "20px" }}>
              Start a conversation by asking a question!
            </Typography>
          ) : (
            messages.map((msg, index) => (
              
              <Box
                ref={index === messages.length - 1 ? lastMessageRef : null}
                key={index}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                  marginBottom: "10px",
                }}
              >
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: msg.sender === 'user' ? '#1976d2' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {msg.sender === 'user' ? '👤' : '🤖'}
                  </Box>
                  <Box
                    sx={{
                      padding: "10px",
                      borderRadius: "10px",
                      maxWidth: "70%",
                      backgroundColor: msg.sender === "user" ? "#1976d2" : "#e0e0e0",
                      color: msg.sender === "user" ? "#fff" : "#000",
                      wordBreak: "break-word",
                      textAlign: "left",
                      boxShadow: 1,
                    }}
                  >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)', fontSize: '0.7rem' }}>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    
                {/* Display PDF Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <Box sx={{ marginTop: "5px", padding: "5px", backgroundColor: "#f1f1f1", borderRadius: "5px" }}>
                    <Typography variant="caption">Sources:</Typography>
                    {msg.sources.map((source, i) => (
                      <Link
                        onClick={() => handleOpenModal(source)}
                        key={i}
                        sx={{  color: "#1976d2", cursor:"pointer" , textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                      >
                        View PDF
                      </Link>
                    ))}
                  </Box>
                )}
                  </Box>
                </Box>

              </Box>
            ))
          )}

          {/* Bot Typing Indicator */}
          {isTyping && (
            <Box sx={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                🤖
              </Box>
              <Box sx={{ padding: "10px", borderRadius: "10px", backgroundColor: "#e0e0e0", color: "#000", textAlign: "left", boxShadow: 1, display: "flex", gap: "5px" }}>
                <CircularProgress size={10} color="inherit" />
                <CircularProgress size={10} color="inherit" />
                <CircularProgress size={10} color="inherit" />
              </Box>
            </Box>
          )}
        </Box>

        {/* PDF Modal */}
        <Modal open={openModal} onClose={handleCloseModal} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box sx={{ width: "80%", height: "80%", backgroundColor: "#fff", padding: "20px", borderRadius: "10px", boxShadow: 24, overflow: "auto" }}>
            {pdfLink ? (
              <Document file={pdfLink}>
                <Page pageNumber={pageNumber} />
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button onClick={() => setPageNumber(pageNumber - 1)} disabled={pageNumber <= 1}>
                    Previous
                  </Button>
                  <Typography variant="caption" sx={{ mx: 2 }}>Page {pageNumber}</Typography>
                  <Button onClick={() => setPageNumber(pageNumber + 1)}>Next</Button>
                </Box>
              </Document>
            ) : (
              <Typography variant="body2">No PDF available</Typography>
            )}
          </Box>
        </Modal>

        {/* Message Input */}
        <Box sx={{ display: "flex", gap: "10px" }}>
          <TextField fullWidth variant="outlined" label="Type your question..." value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={handleKeyDown} />
          <Button variant="contained" color="primary" onClick={handleSendMessage} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Send"}
          </Button>
        </Box>
      </Paper>
    </ErrorBoundary>
  );
};

export default Chatbot;
