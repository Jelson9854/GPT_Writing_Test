"use client";
import "bootstrap/dist/css/bootstrap.css";
import "./globals.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Tabs,
  Tab,
  Modal,
  Form,
  Button,
} from "react-bootstrap";
import MyCodeMirrorComponent from "../components/MyCodeMirror";
import { useChat } from "ai/react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { FaArrowAltCircleUp } from "react-icons/fa";

type CopiedText = {
  time: string;
  text: string;
  tab: string;
};

type TimerThing = {
  tab: string;
  time: string;
};

export default function Webpage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [recordingData, setRecordingData] = useState([]);
  const ID = useState(() => uuidv4())[0]; // Initialize ID using an initializer function
  const [user_email, setUserEmail] = useState<string | null>("");
  const [show, setShow] = useState(true);
  const [text, setText] = useState("");
  const [copiedTexts, setCopiedTexts] = useState<CopiedText[]>([]);
  const [tab, setTab] = useState("prompt");
  const [tempVar, setTempVar] = useState("prompt");
  const [tabLog, setTabLog] = useState<TimerThing[]>([]);
  const [time, setTime] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const emailFromURL = urlParams.get("email");
    console.log(emailFromURL);
    setUserEmail(emailFromURL);
  }, []);

  useEffect(() => {
    const handleLoad = () => {
      const timestamp = new Date().toISOString();
      setTabLog((prevLogs) => [
        ...prevLogs,
        { tab: "prompt", time: timestamp },
      ]);
    };

    window.onload = handleLoad;
  });

  const handleClose = () => {
    setShow(false);
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();
    const timestamp = new Date().toISOString();
    setShow(false); // Close the modal here
    setTabLog((prevLogs) => [...prevLogs, { tab: "prompt", time: timestamp }]);
    setRunning(true);
    sendEmail(user_email, ID, timestamp);
  };

  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const text = window.getSelection()?.toString();
      if (text) {
        const timestamp = new Date().toISOString();

        let currentTab = "prompt"; // Default to 'prompt' if not within 'editors' or 'gpt'

        // Check if the copy event occurs within an element with the class 'editors'
        const targetElement = e.target as Element | null;
        const isWithinEditors = targetElement?.closest(".editors");

        // Check if the copy event occurs within the GPT tab
        const isWithinGptTab = targetElement?.closest(".gpt_tab"); // Example class for GPT tab

        if (isWithinEditors) {
          currentTab = "editor"; // Set the tab to 'editor' if within 'editors'
          console.log(currentTab);
        } else if (isWithinGptTab) {
          currentTab = "gpt"; // Set the tab to 'gpt' if within the GPT tab
          console.log(currentTab);
        } else {
          currentTab = "prompt"; // Default to 'prompt' if not within 'editors' or 'gpt'
          console.log(currentTab);
        }

        // Create the copied text item
        let item = { time: timestamp, text: text, tab: currentTab };
        setCopiedTexts((prevTexts) => [...prevTexts, item]);
      }
    };

    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("copy", handleCopy);
    };
  }, []);
  // Ensure to include 'tab' in the dependency array for useEffect

  useEffect(() => {
    window.addEventListener("beforeunload", function (e) {
      e.preventDefault();
      e.returnValue =
        "Do you want to leave the page? Your progress will NOT be saved. If you have already submitted, you can ignore this message.";
      setTimeout(function () {
        // Timeout to wait for user response
        setTimeout(function () {
          // Timeout to wait onunload, if not fired then this will be executed
          console.log("User stayed on the page.");
        }, 50);
      }, 50);
      return "Do you want to leave the page? Your progress will NOT be saved. If you have already submitted, you can ignore this message.";
    });
  });

  const onEnterPress = (e) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTabChange = (t) => {
    // Only update tab state if the tab change is from the navbar
    if (typeof t == "string") {
      const timestamp = new Date().toISOString();
      console.log("Tab changed to:", t, "at:", timestamp);
      setTab(t);
      setTabLog((prevLogs) => [...prevLogs, { tab: t, time: timestamp }]);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        console.log("Tab is now hidden");
        setTempVar(tab);
        handleTabChange("hidden");
        // Add your logic here for when the tab becomes hidden
      } else if (document.visibilityState === "visible") {
        console.log("Tab is now visible");
        handleTabChange(tempVar);
        // Add your logic here for when the tab becomes visible
      }
    };

    // Add event listener for visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  });

  // Stopwatch Function
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (running) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (!running && time !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running, time]);

  const formatTime = (seconds: number): string => {
    const getSeconds = `0${seconds % 60}`.slice(-2);
    const totalMinutes = Math.floor(seconds / 60);
    const getMinutes = `0${totalMinutes % 60}`.slice(-2);
    const getHours = `0${Math.floor(totalMinutes / 60)}`.slice(-2);
    return `${getHours} : ${getMinutes} : ${getSeconds}`;
  };

  return (
    <>
      <Container>
        <Modal
          show={show}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header>
            <Modal.Title className="modal-header">Instructions</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ul>
              <li>
              The text box on this website starts recording immediately, any
              operations made will be recorded.
              </li>
              <li>
              There is a stopwatch
              in the bottom left corner. Please do not spend any longer than
              30-40 minutes writing your essay.
              </li> 
              <li>
              If you wish to use ChatGPT please click the ChatGPT tab and ask questions
              </li>
              <li>
              If you leave the webpage we will not store your
              data, so you will lose your response.
              </li>
              <li>
              Upon completion of the essay, hit
              the submit button. Only hit the submission
              button once at the end to not overwrite your data.
              </li>
              <li>
              Upon submission
              you will be redirected to an exit survey. If you were not
              redirected, please contact the researcher. The redirect is
              considered a pop-up so it might be blocked.
              </li>

            </ul>
            <br />
            <Button variant="secondary" type="submit" onClick={onFormSubmit}>
              Start
            </Button>
          </Modal.Body>
        </Modal>
        <Row className="justify-content pr-0">
          <Tabs
            justify
            variant="tabs"
            defaultActiveKey={"prompt"}
            className="pr-0"
            onSelect={handleTabChange}
          >
            <Tab eventKey="prompt" title="Writing" className="content">
              <div className="margins">
                <div className="fixed bottom-0 left-0 m-4 p-4 bg-gray-800 text-white rounded-lg">
                  <div>{formatTime(time)}</div>
                  <div className="mt-2"></div>
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <div className="question flex flex-col gap-6 border border-black">
                  <span className="body-text-small">
                    We will describe an issue and provide three different
                    perspectives on the issue. You are asked to read and
                    consider the issue and perspectives, state your own
                    perspective on the issue, and analyze the relationship
                    between your perspective and at least one other perspective
                    on the issue.
                  </span>
                  <span>
                    <h2 className="font-bold">Issue:</h2>
                    <p>
                      Automation is generally seen as a sign of progress, but
                      what is lost when we replace humans with machines?
                    </p>
                  </span>
                  <span>
                    <h2 className="font-bold">Intelligent Machines</h2>
                  </span>
                  <span className="body-text-small-dark">
                    Many of the goods and services we depend on daily are now
                    supplied by intelligent, automated machines rather than
                    human beings. Robots build cars and other goods on assembly
                    lines, where once there were human workers. Many of our
                    phone conversations are now conducted not with people but
                    with sophisticated technologies. We can now buy goods at a
                    variety of stores without the help of a human cashier.
                    Automation is generally seen as a sign of progress, but what
                    is lost when we replace humans with machines? Given the
                    accelerating variety and prevalence of intelligent machines,
                    it is worth examining the implications and meaning of their
                    presence in our lives.
                  </span>
                  <p></p>
                  <div className="grid grid-cols-[2fr_1fr] gap-4">
                    <div className="mb-3 pr-5 border-r border-black">
                      <h3 className="font-bold">Perspective One</h3>
                      <span className="body-text-small-dark">
                        What we lose with the replacement of people by machines
                        is some part of our own humanity. Even our mundane daily
                        encounters no longer require from us basic courtesy,
                        respect, and tolerance for other people.
                      </span>
                    </div>
                    <div className="mb-3">
                      <h3 className="font-bold">Meaning</h3>
                      <span className="body-text-small-dark">
                        Intelligent machines are a detriment to humanity.
                      </span>
                    </div>
                    <div className="my-3 pr-5 border-r border-black">
                      <h3 className="font-bold">Perspective Two</h3>
                      <span className="body-text-small-dark">
                        Machines are good at low-skill, repetitive jobs, and at
                        high-speed, extremely precise jobs. In both cases they
                        work better than humans. This efficiency leads to a more
                        prosperous and progressive world for everyone.
                      </span>
                    </div>
                    <div className="my-3">
                      <h3 className="font-bold">Meaning</h3>
                      <span className="body-text-small-dark">
                        In some areas, machines replacing humans is better.
                      </span>
                    </div>
                    <div className="mt-3 pr-5 border-r border-black">
                      <h3 className="font-bold">Perspective Three</h3>
                      <span className="body-text-small-dark">
                        Intelligent machines challenge our long-standing ideas
                        about what humans are or can be. This is good because it
                        pushes both humans and machines toward new, unimagined
                        possibilities.
                      </span>
                    </div>
                    <div className="mt-3">
                      <h3 className="font-bold">Meaning</h3>
                      <span className="body-text-small-dark">
                        Machines are very beneficial to society and human
                        technological advancement.
                      </span>
                    </div>
                  </div>
                </div>
                <div className="editors border border-black">
                  <MyCodeMirrorComponent
                    email={user_email}
                    sendToDB={(recordingData, fintext) =>
                      sendToDB(
                        user_email,
                        messages,
                        recordingData,
                        fintext,
                        copiedTexts,
                        tabLog,
                        ID
                      )
                    }
                    updateRecordingData={setRecordingData}
                    updateFinalText={setText}
                  />
                </div>
                {/* <Button
                variant="primary"
                onClick={() =>
                  console.log(`Time on Current Tab: ${currentTabTime} seconds, Time on Different Tab: ${differentTabTime} seconds`)
                }
              >
                Log Time
              </Button> */}
              </div>
            </Tab>
            <Tab eventKey={"gpt"} title="ChatGPT" onSelect={handleTabChange}>
              <div className="margins"></div>
              <div className="flex flex-col items-center justify-center gap-3 gpt_tab">
                <div className="flex flex-col justify-between border border-black rounded-md !min-w-full overflow-y-scroll overflow-x-hidden">
                  <div className="edit mb-auto h-[80vh] !min-w-full">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={
                          m.role === "user"
                            ? "row w-full py-[20px] pl-[50px] text-black mx-0 border border-black"
                            : "row w-full py-[20px] pl-[50px] bg-white text-black mx-0 border border-black"
                        }
                      >
                        <div className="chat-icon">
                          <Image
                            width={40}
                            height={40}
                            src={
                              m.role === "user"
                                ? "/images/user-icon.png"
                                : "/images/chatgpt-icon.png"
                            }
                            alt={m.role === "user" ? "User" : "ChatGPT"}
                            className="chatgpt-icon"
                          />
                          <div className="identity-bold">
                            {" "}
                            {m.role === "user" ? "User" : "ChatGPT"}
                          </div>
                        </div>
                        <div className="whitespace-pre-wrap identity">
                          {m.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <form
                  className="overflow-hidden bg-white flex align-content-center items-center justify-center h-26 mt-auto border border-black rounded-md"
                  onSubmit={handleSubmit}
                >
                  <textarea
                    className="bottom-0 w-full max-w-xl p-2 chat-inputs-container h-15"
                    value={input}
                    placeholder="Message ChatGPT..."
                    onChange={handleInputChange}
                    onKeyDown={(e) => onEnterPress(e)}
                  ></textarea>
                  <Button
                    type="submit"
                    variant="ghost"
                    className="!bg-transparent chat-btn p-0 m-0 h-[40px] w-[40px]"
                  >
                    <FaArrowAltCircleUp size={40} />
                  </Button>
                </form>
              </div>
            </Tab>
          </Tabs>
        </Row>
      </Container>
    </>
  );
}

async function sendToDB(
  user_email,
  mess,
  recording,
  text,
  copies,
  timers,
  objectId
) {
  const timestamp = new Date().toISOString();

  try {
    // Make the first asynchronous request to save messages
    const messageResponse = await axios.post(
      "https://gptwriting.cs.vt.edu/research/save_messages",
      {
        user_id: objectId,
        email: user_email,
        mess_array: mess,
        copy_array: copies,
        timer_array: timers,
      }
    );
    console.log("Message saved:", messageResponse.data);

    // Make the second asynchronous request to save recording and text
    const recordingResponse = await axios.post(
      "https://gptwriting.cs.vt.edu/research/save_recording",
      {
        user_id: objectId,
        email: user_email,
        rec_thingy: recording,
        final_text: text,
        end_time: timestamp,
      }
    );
    console.log(timestamp);
    console.log("Recording and final text saved:", recordingResponse.data);

    // Return whatever information is needed
    return { messageResponse, recordingResponse };
  } catch (error) {
    console.error("Error saving data:", error);
    throw error; // Propagate the error further if needed
  }
}

async function sendEmail(user_email, objectId, startTime) {
  const timestamp = new Date().toISOString();
  try {
    const emailResponse = await axios.post(
      "https://gptwriting.cs.vt.edu/research/save_email",
      {
        user_id: objectId,
        email: user_email,
        start: timestamp,
      }
    );
    console.log("Email saved to databases: ", emailResponse.data);
  } catch (error) {
    console.error("Error saving data: ", error);
    throw error;
  }
}
