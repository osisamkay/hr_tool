import axios from "axios";

const Base_Url = process.env.REACT_APP_API_URL || 'http://127.0.0.1:7860';

export const sendMessage = async (inputMessage, setMessages, setIsLoading, setIsTyping) => {
  if (!inputMessage.trim()) {
    alert("Please enter a message!");
    return;
  }

  setMessages((prevMessages) => [...prevMessages, { sender: "user", text: inputMessage }]);
  setIsLoading(true);
  setIsTyping(true);

  const maxRetries = 3;
  let attempt = 0;
  let success = false;
  let response;

  while (attempt < maxRetries && !success) {
    try {
      response = await axios.post(
        `${Base_Url}/chatbot`, // ✅
        {
          message: inputMessage,
          username: "guest",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      success = true;
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed: `, error);
      if (attempt >= maxRetries) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Sorry, there was an error. Please try again later!" },
        ]);
        setIsLoading(false);
        setIsTyping(false);
        return;
      }
    }
  }

  if (response) {
    const botResponse = response.data.response;
    const sources = response.data.sources || [];

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "bot", text: botResponse, sources },
    ]);
  }

  setIsLoading(false);
  setIsTyping(false);
};
