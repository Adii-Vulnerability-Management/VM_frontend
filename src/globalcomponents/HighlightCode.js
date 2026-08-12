import { Fragment } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Highlight, themes } from "prism-react-renderer";

const HighlightCode = ({ code }) => {
  const copyAction = (event) => {
    event.target.textContent = "Copied";
    setTimeout(() => {
      event.target.textContent = "Copy";
    }, 3000);
  };

  return (
    <Fragment>
      <CopyToClipboard text={code}>
        <button
          onClick={copyAction}
          className="bg-white text-[#2B245C] border border-[#2B245C] text-sm px-4 py-2 rounded-lg shadow hover:bg-blue-50 focus:outline-none float-right m-2"
        >
          Copy
        </button>
      </CopyToClipboard>
      <Highlight
        theme={themes.shadesOfPurple} // Pass the theme directly
        code={code}
        language="jsx" // Provide the language explicitly
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} overflow-auto rounded-md p-4`}
            style={style}
          >
            {tokens.map((line, i) => (
              <div {...getLineProps({ line, key: i })} key={`line-${i}`}>
                {line.map((token, key) => (
                  <span
                    {...getTokenProps({ token, key })}
                    key={`token-${key}`}
                  />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </Fragment>
  );
};

export default HighlightCode;
