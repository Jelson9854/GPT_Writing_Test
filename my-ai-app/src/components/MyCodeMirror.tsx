import React, {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css"; // Example theme
import { CodeRecord } from "codemirror-record"; // Ensure this is the correct import

interface MyCodeMirrorComponentProps {
  sendToDB: (recording: any) => Promise<any>;
  updateRecordingData: (data: any) => void;
}

interface CodeRecordInstance {
  listen: () => void;
  getRecords: () => string; // Adjust the return type as necessary
}

const MyCodeMirrorComponent = forwardRef<any, MyCodeMirrorComponentProps>(
  (props, ref) => {
    const codeMirrorRef = useRef(null);
    const codeRecorderRef = useRef<CodeRecordInstance | null>(null);
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (
        typeof window !== "undefined" &&
        codeMirrorRef.current &&
        count === 0
      ) {
        const codeMirrorInstance = CodeMirror(codeMirrorRef.current, {
          lineNumbers: false,
          lineWrapping: true,
          // spellcheck: true,
          theme: "material",
        });

        setCount(1);

        // Initialize codemirror-record with the CodeMirror instance
        const codeRecorder = new CodeRecord(codeMirrorInstance);
        codeRecorder.listen(); // Start listening for changes

        // Store the codeRecorder instance in a ref for later use
        codeRecorderRef.current = codeRecorder;
      }
    }, []); // Empty dependency array means this effect runs once on mount

    useImperativeHandle(ref, () => ({
      getRecords: () => {
        if (codeRecorderRef.current) {
          return codeRecorderRef.current.getRecords();
        }
        return "";
      },
    }));

    const handleSubmission = useCallback(() => {
      const isConfirmed = window.confirm("Are you sure you want to submit?");

      // Check if the user clicked "OK"
      if (isConfirmed) {
        if (codeRecorderRef.current) {
          const recordsString = codeRecorderRef.current.getRecords();
          console.log(recordsString); // This should log the string representation of the array

          // Attempt to parse the string into an array
          let recordsArray;
          try {
            recordsArray = JSON.parse(recordsString);
            console.log(recordsArray); // This should log the array
          } catch (error) {
            console.error("Error parsing records:", error);
            return; // Exit the function if parsing fails
          }

          if (recordsArray && recordsArray.length > 0) {
            console.log("operations added");
            console.log(recordsArray);

            // Update recordingData in the parent component
            props.updateRecordingData(recordsArray); // Use the parsed array

            // Attempt to send data to the server with error handling
            props
              .sendToDB(recordsArray)
              .then((response) => {
                console.log("Data sent successfully:", response);
                alert("Thank you for your submission");
              })
              .catch((error) => {
                console.error("Error sending data:", error);
              });
          } else {
            console.log("no operation to be added");
          }
        }
      }
    }, [props]); // Add props to the dependency array

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
