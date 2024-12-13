import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const MyEditor = () => {
    const [content, setContent] = useState("");

    return (
        <div>
            <h2>CKEditor Free Version</h2>
            <CKEditor
                editor={ClassicEditor}
                data={content || "<p>Viết nội dung của bạn ở đây...</p>"}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    setContent(data);
                }}
            />

            <h3>Output:</h3>
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
};

export default MyEditor;
