"use client";
import "bootstrap/dist/css/bootstrap.css";
import "./globals.css";
import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from 'axios';
import { useChat } from "ai/react";
import { Container, Row, Tabs, Tab } from "react-bootstrap";;
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import MyCodeMirrorComponent from '../components/MyCodeMirror'; // Adjust the import path as necessary

export default function Webpage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [recordingData, setRecordingData] = React.useState([]);
  const [ID, setID] = React.useState("");
  const [user_email, setUserEmail] = React.useState("");
  const [show, setShow] = React.useState(false);
  useEffect(() => {
    if(show === false)
    {
      setShow(true)
      console.log(process.env.OPEN_AI_KEY)
    }
  }, [])

  const handleClose = () => {
    setShow(false);
  }

  const onFormSubmit = (e) => {
    e.preventDefault();
    const em = e.target[0].value;
    setUserEmail(em);
    sendDataToServer(0);
    handleClose();
   };

  useEffect(  () => {
    // const recorder = document.getElementById('editor-record')
    // const codeRecorder = new CodeRecord(recorder);

    // console.log(codeRecorder)

    // codeRecorder.listen()

    window.addEventListener('beforeunload', function (e) {
      e.preventDefault();
      e.returnValue = 'Do you want to leave the page?';
      setTimeout(function () { // Timeout to wait for user response
          setTimeout(function () { // Timeout to wait onunload, if not fired then this will be executed
              console.log('User stayed on the page.');
      }, 50)}, 50);
      return 'Do you want to leave the page?';
  });
  })

  useEffect(() => {
    console.log('ID state changed:', ID);
   }, [ID]);


   const sendDataToServer = async (type) => {
    if(type === 1) {
    
    }
    try {
       console.log('sending to server');
       let thingy = await sendToDB(
         user_email,
         messages,
         recordingData,
         ID,
         type,
       );
       console.log(thingy);
       if (type === 0 && thingy) {
         setID(thingy);
         console.log('ID updated:', ID); // This might not log the updated ID immediately due to state update batching
       }
    } catch (error) {
       console.error('Error sending data:', error);
    }
   };

  return (
    <>
      <Container>
        <Modal show={show} onHide={handleClose} backdrop="static">
          <Modal.Header>
            <Modal.Title className="modal-header">Enter Your Email</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Instructions for use:
              <br />
              Enter your email to start the assignment. The text box starts recording immediately. If you wish to use ChatGPT please 
              click the ChatGPT tab. Upon completion hit the submit button. If you leave the page we will not store your data, so you 
              will lose your response. Only hit the submission button once at the end to not overwrite your data.
            </p>
            <br />
            <Form onSubmit={onFormSubmit}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="name@example.com"
                autoFocus
                value={user_email}
                onChange={(e) => setUserEmail(e.target.value)}
              />
              </Form.Group>
              <Button variant="secondary" type='submit'>
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
                  <MyCodeMirrorComponent sendToDB={(recordingData) => sendToDB(user_email, messages, recordingData, ID, 1)} 
                  updateRecordingData={setRecordingData}
                  />
                  {/* <textarea
                    id="editor-record"
                    defaultValue="Please write your response to the essay question here. When finished, click Recorder: Get records then Player: Add operations."
                  ></textarea> */}
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
                        <img
                          className="chatgpt-icon"
                          src={
                            m.role === "user"
                              ? "images/user-icon.png"
                              : "images/chatgpt-icon.png"
                          }
                        ></img>
                        <div className="identity-bold">    {m.role === "user" ? "User" : "ChatGPT"}</div>
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

async function sendToDB(user_email, mess, recording, id, type){
  if (type == 0) {
    try {
        // Make an asynchronous request to the server
        const response = await axios.post('http://localhost:8080/save_id', {
            email: user_email,
            messages: mess,
            rec_thingy: recording,
        });
        console.log(response.data)

        id = response.data.data._id;
        // Extract the tweetID from the response
        return id;
    } catch (error) {
        console.error("Error saving email:", error);
        throw error; // Propagate the error further if needed
    }
    }
    else {
      try {
          // Make an asynchronous request to the server
          const response = await axios.post('http://localhost:8080/submission', {
            __id: id,
            email: user_email,
            messages: mess,
            rec_thingy: recording,
        });
        console.log(response.data)
        console.log(mess)
      } catch (error) {
          console.error("Error saving to database:", error);
          throw error; // Propagate the error further if needed
      }
    }  
  }