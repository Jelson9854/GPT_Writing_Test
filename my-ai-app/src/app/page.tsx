'use client'
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
import { v4 as uuidv4 } from 'uuid';


export default function Webpage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [recordingData, setRecordingData] = useState([]);
  const ID = useState(() => uuidv4())[0]; // Initialize ID using an initializer function
  const [user_email, setUserEmail] = useState("");
  const [show, setShow] = useState(true);
  const [text, setText] = useState("");
  const [copiedTexts, setCopiedTexts] = useState<string[]>([]);

  const handleClose = () => {
      setShow(false);
  };
  
  const onFormSubmit = async (e) => {
    e.preventDefault();
    const em = e.target[0].value;
  
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!emailRegex.test(em)) {
      alert("Please enter a valid email address.");
      return;
    }
  
    setUserEmail(em);
    setShow(false); // Close the modal here
    sendEmail(user_email, ID);
  };

  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const text = window.getSelection()?.toString();
      if (text) {
        const timestamp = new Date().toISOString();
        setCopiedTexts((prevTexts) => [...prevTexts, `${timestamp}: ${text}`]);
      }
    };

    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("copy", handleCopy);
    };
  }, []);
  

  useEffect(() => {
    window.addEventListener("beforeunload", function (e) {
      e.preventDefault();
      e.returnValue = "Do you want to leave the page?";
      setTimeout(function () {
        // Timeout to wait for user response
        setTimeout(function () {
          // Timeout to wait onunload, if not fired then this will be executed
          console.log("User stayed on the page.");
        }, 50);
      }, 50);
      return "Do you want to leave the page?";
    });
  });

  useEffect(() => {
    console.log("ID state changed:", ID);
  }, [ID]);

  return (
    <>
      <Container>
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
          <Modal.Header>
            <Modal.Title className="modal-header">Enter Your Email</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Instructions for use:
              <br />
              Enter your email to start the assignment. The text box starts
              recording immediately. If you wish to use ChatGPT please click the
              ChatGPT tab. Upon completion hit the submit button. If you leave
              the page we will not store your data, so you will lose your
              response. Only hit the submission button once at the end to not
              overwrite your data.
            </p>
            <br />
            <Form onSubmit={onFormSubmit}>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="name@example.com"
                  autoFocus
                  value={user_email}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </Form.Group>
              <Button variant="secondary" type="submit">
                Submit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
        <Row className="justify-content">
          <Tabs justify variant="tabs" defaultActiveKey={"prompt"}>
            <Tab eventKey="prompt" title="Writing" className="content">
              <div className="margins"></div>
              <div className="question">
                <p>
                  The test describes an issue and provides three different
                  perspectives on the issue. You are asked to read and consider
                  the issue and perspectives, state your own perspective on the
                  issue, and analyze the relationship between your perspective
                  and at least one other perspective on the issue. Your score
                  will not be affected by the perspective you take on the issue.
                </p>
                <p>
                  <b>Intelligent Machines</b>
                </p>
                <p className="txt-center">
                  Many of the goods and services we depend on daily are now
                  supplied by intelligent, automated machines rather than human
                  beings. Robots build cars and other goods on assembly lines,
                  where once there were human workers. Many of our phone
                  conversations are now conducted not with people but with
                  sophisticated technologies. We can now buy goods at a variety
                  of stores without the help of a human cashier. Automation is
                  generally seen as a sign of progress, but what is lost when we
                  replace humans with machines? Given the accelerating variety
                  and prevalence of intelligent machines, it is worth examining
                  the implications and meaning of their presence in our lives.
                </p>
                <p></p>
                <div className="table-scroll">
                  <table>
                    <tbody>
                      <tr>
                        <th>Perspective One</th>
                        <th>Perspective Two</th>
                        <th>Perspective Three</th>
                      </tr>
                      <tr>
                        <td>
                          <span className="body-text-small-dark">
                            What we lose with the replacement of people by
                            machines is some part of our own humanity. Even our
                            mundane daily encounters no longer require from us
                            basic courtesy, respect, and tolerance for other
                            people.
                          </span>
                        </td>
                        <td>
                          <span className="body-text-small-dark">
                            Machines are good at low-skill, repetitive jobs, and
                            at high-speed, extremely precise jobs. In both cases
                            they work better than humans. This efficiency leads
                            to a more prosperous and progressive world for
                            everyone.
                          </span>
                        </td>
                        <td>
                          <span className="body-text-small-dark">
                            Intelligent machines challenge our long-standing
                            ideas about what humans are or can be. This is good
                            because it pushes both humans and machines toward
                            new, unimagined possibilities.
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <main className="editors">
                <MyCodeMirrorComponent
                  sendToDB={(recordingData, fintext) =>
                    sendToDB(user_email, messages, recordingData, fintext, copiedTexts, ID)
                  }
                  updateRecordingData={setRecordingData}
                  updateFinalText={setText}
                />
              </main>
            </Tab>
            <Tab eventKey={"gpt"} title="ChatGPT">
              <div className="margins"></div>
              <div className="" id="chat-area">
                <div className="chat-content-area">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={
                        m.role === "user"
                          ? "row user-chat-box"
                          : "row gpt-chat-box"
                      }
                    >
                      <div className="chat-icon">
                        <Image  width={40} height={40}
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
                  <form
                    className="chat-input-area overflow-hidden"
                    onSubmit={handleSubmit}
                  >
                    <input
                      className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl chat-inputs-container"
                      value={input}
                      placeholder="Message ChatGPT..."
                      onChange={handleInputChange}
                    />
                  </form>
                </div>
              </div>
            </Tab>
          </Tabs>
        </Row>
        {/* <Script src="../js/webpage.js" strategy="beforeInteractive"/> */}
      </Container>
    </>
  );
}

async function sendToDB(user_email, mess, recording, text, copies, objectId) {
  try {
    // Make the first asynchronous request to save messages
    const messageResponse = await axios.post("http://localhost:8080/save_messages", {
      user_id: objectId,
      email: user_email,
      mess_array: mess,
      copy_array: copies,
    });
    console.log("Message saved:", messageResponse.data);

    // Make the second asynchronous request to save recording and text
    const recordingResponse = await axios.post("http://localhost:8080/save_recording", {
      user_id: objectId,
      email: user_email,
      rec_thingy: recording,
      final_text: text,
    });
    console.log("Recording and final text saved:", recordingResponse.data);

    // Return whatever information is needed
    return { messageResponse, recordingResponse };
  } catch (error) {
    console.error("Error saving data:", error);
    throw error; // Propagate the error further if needed
  }
}

async function sendEmail(user_email, objectId)
{
  try {
    const emailResponse = await axios.post("http://localhost:8080/save_email", {
      user_id: objectId,
      email: user_email,
    });
    console.log("Email saved to databases: ", emailResponse.data)
  } catch(error)
  {
    console.error("Error saving data: ", error);
    throw error;
  }
}