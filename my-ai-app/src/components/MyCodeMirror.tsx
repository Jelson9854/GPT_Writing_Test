import React, {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import { Modal } from 'react-bootstrap';
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material-darker.css"; // Example theme
import CodeMirror from "codemirror";
import { CodeRecord } from "codemirror-record"; // Ensure this is the correct import
import 'codemirror-spell-checker';

interface MyCodeMirrorComponentProps {
  email: string | null;
  sendToDB: (recording: any, fintext: any) => Promise<any>;
  updateRecordingData: (data: any) => void;
  updateFinalText: (data: any) => void;
}

interface CodeRecordInstance {
  listen: () => void;
  getRecords: () => string; // Adjust the return type as necessary
}

const MyCodeMirrorComponent = forwardRef<any, MyCodeMirrorComponentProps>(
  (props, ref) => {
    const user_email = props.email;
    const codeMirrorRef = useRef<HTMLDivElement>(null);
    const codeRecorderRef = useRef<CodeRecordInstance | null>(null);
    const codeMirrorInstanceRef = useRef<CodeMirror.Editor | null>(null);
    const countRef = useRef<number>(0);
    const [modalShow, setModalShow] = useState(false);

    useEffect(() => {
      if (typeof window !== "undefined" && codeMirrorRef.current && countRef.current === 0) {
        const codeMirrorInstance = CodeMirror(codeMirrorRef.current, {
          lineNumbers: false,
          lineWrapping: true,
          theme: "elegant",
          spellcheck: true,
        });
    
        countRef.current += 1;
    
        codeMirrorInstanceRef.current = codeMirrorInstance;
    
        const codeRecorder = new CodeRecord(codeMirrorInstance);
        codeRecorder.listen();
    
        codeRecorderRef.current = codeRecorder;
      }
    }, []);

    const handleSubmission = useCallback(() => {
      // const isConfirmed = window.confirm("Are you sure you want to submit? Please wait for the popup window to appear for the exit survey.");
      const isConfirmed = true;
      setModalShow(true);
      if (isConfirmed && codeRecorderRef.current) {
        // Retrieve the final text
        const lines = codeMirrorInstanceRef.current?.getValue().split("\n");
        const finText = lines;

        // Retrieve the recording data
        const recordsString = codeRecorderRef.current.getRecords();
        let recordsArray;
        try {
          recordsArray = JSON.parse(recordsString);
        } catch (error) {
          console.error("Error parsing records:", error);
          return; // Exit the function if parsing fails
        }

        if (recordsArray && recordsArray.length > 0) {
          console.log("operations added");
          console.log(recordsArray);

          // Update recordingData in the parent component
          props.updateRecordingData(recordsArray); // Use the parsed array

          props.updateFinalText(finText);

          // Attempt to send data to the server with error handling
          props
            .sendToDB(recordsArray, finText)
            .then((response) => {
              console.log("Data sent successfully:", response);
              // let cont = window.confirm("Thank you for your submission. Please fill out the exit survey \n\nYour participation is greatly appreciated!");
              // if(cont)
              //   {
              window.open("https://virginiatech.questionpro.com/GPTWritingExitSurvey?ext_ref="+ user_email)
              //   }
            })
            .catch((error) => {
              console.error("Error sending data:", error);
            });
        } else {
          console.log("no operation to be added");
        }

        console.log("final text array:", finText);
      }
    }, [props]);

    useImperativeHandle(ref, () => ({
      getRecords: () => {
        if (codeRecorderRef.current) {
          return codeRecorderRef.current.getRecords();
        }
        return "";
      },
    }));

    return (
      <>
      <Modal
        show={modalShow}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Thank you for your submission!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        Your participation is greatly appreciated!
        <br />
        Please fill out the exit survey. You should be redirected in a moment.
        <br />
        If you were not redirected. Please take the exit survey at https://virginiatech.questionpro.com/GPTWritingExitSurvey.
        </Modal.Body>
      </Modal>
      <div>
        <div className="border-b border-black" ref={codeMirrorRef}></div>
        <div className="control-buttons">
          <button
            id="submission"
            className="btn btn-primary"
            onClick={() => handleSubmission()}
          >
            Submit Everything
          </button>
        </div>
      </div>
      </>

    );
  }
);

MyCodeMirrorComponent.displayName = "MyCodeMirrorComponent";

export default React.memo(MyCodeMirrorComponent);
