import React, {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material-darker.css"; // Example theme
import CodeMirror from "codemirror";
import { CodeRecord } from "codemirror-record"; // Ensure this is the correct import
import 'codemirror-spell-checker';

interface MyCodeMirrorComponentProps {
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
    const codeMirrorRef = useRef<HTMLDivElement>(null);
    const codeRecorderRef = useRef<CodeRecordInstance | null>(null);
    const codeMirrorInstanceRef = useRef<CodeMirror.Editor | null>(null);
    const countRef = useRef<number>(0);

    useEffect(() => {
      if (typeof window !== "undefined" && codeMirrorRef.current && countRef.current === 0) {
        const codeMirrorInstance = CodeMirror(codeMirrorRef.current, {
          lineNumbers: false,
          lineWrapping: true,
          theme: "material-darker",
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
      const isConfirmed = window.confirm("Are you sure you want to submit? Please wait for the popup window to appear for the exit survey.");
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
              alert("Thank you for your submission. Please fill out the exit survey at the following link: \nhttps://virginiatech.questionpro.com/GPTWritingExitSurvey \nYour participation is greatly appreciated!");
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
      <div>
        <div ref={codeMirrorRef}></div>
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
    );
  }
);

MyCodeMirrorComponent.displayName = "MyCodeMirrorComponent";

export default React.memo(MyCodeMirrorComponent);
