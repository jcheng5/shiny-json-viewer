import React, { useState, useCallback, useMemo } from "react";
import r2wc from "@r2wc/react-to-web-component";
import tailwindStyles from "./json-viewer.css";
import ReactDOM from "react-dom/client";

interface JSONNodeProps {
  data: any;
  name: string;
  level: number;
  isRoot?: boolean;
}

interface JSONViewerProps {
  data: any;
}

// Main component
const JSONViewer: React.FC<JSONViewerProps> = ({ data }) => {
  return (
    <div className="overflow-auto max-h-screen border border-gray-300 rounded p-4 font-mono text-sm bg-gray-50">
      <JSONNode data={data} name="root" level={0} isRoot={true} />
    </div>
  );
};

// Component to handle different data types
const JSONNode: React.FC<JSONNodeProps> = ({
  data,
  name,
  level,
  isRoot = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(
    isRoot ||
      (Array.isArray(data) && data.length <= 2) ||
      (typeof data === "object" &&
        data !== null &&
        Object.keys(data).length <= 2)
  );
  const [isFullStringVisible, setIsFullStringVisible] = useState(false);

  const toggle = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const toggleStringView = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      setIsFullStringVisible(!isFullStringVisible);
    },
    [isFullStringVisible]
  );

  // Determine the type of data to render
  const type = Array.isArray(data)
    ? "array"
    : data === null
    ? "null"
    : typeof data;

  // Calculate proper indentation margins
  // We'll use margin-left for the containers rather than padding
  const nodeIndentStyle = useMemo(
    () => ({
      marginLeft: isRoot ? 0 : `${level * 20}px`,
    }),
    [level, isRoot]
  );

  // Function to check if a string is long
  const isLongString = useCallback((str: string) => {
    return typeof str === "string" && str.length > 100;
  }, []);

  // Component content based on data type
  const renderContent = () => {
    switch (type) {
      case "array":
        return (
          <>
            <div
              className="cursor-pointer hover:bg-gray-200 py-1"
              onClick={toggle}
              style={nodeIndentStyle}
            >
              {!isRoot && <span className="text-purple-600">{name}: </span>}
              <span className="text-gray-600">
                [{isExpanded ? "" : `...${data.length} items`}]
              </span>
              {!isExpanded && (
                <span className="ml-1 text-gray-400 text-xs">
                  ({data.length} items)
                </span>
              )}
            </div>

            {isExpanded && (
              <div>
                {data.map((item: any, index: number) => (
                  <JSONNode
                    key={index}
                    data={item}
                    name={index.toString()}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </>
        );

      case "object":
        if (data === null) {
          return (
            <div style={nodeIndentStyle} className="py-1">
              {!isRoot && <span className="text-purple-600">{name}: </span>}
              <span className="text-gray-800">null</span>
            </div>
          );
        }

        const keys = Object.keys(data);

        return (
          <>
            <div
              className="cursor-pointer hover:bg-gray-200 py-1"
              onClick={toggle}
              style={nodeIndentStyle}
            >
              {!isRoot && <span className="text-purple-600">{name}: </span>}
              <span className="text-gray-600">
                {"{"}
                {isExpanded ? "" : "..."}
                {"}"}
              </span>
              {!isExpanded && (
                <span className="ml-1 text-gray-400 text-xs">
                  ({keys.length} properties)
                </span>
              )}
            </div>

            {isExpanded && (
              <div>
                {keys.map((key) => (
                  <JSONNode
                    key={key}
                    data={data[key]}
                    name={key}
                    level={level + 1}
                  />
                ))}
              </div>
            )}
          </>
        );

      case "string":
        if (isLongString(data)) {
          // For very long strings
          return (
            <div className="hover:bg-gray-200 py-1" style={nodeIndentStyle}>
              <span className="text-purple-600">{name}: </span>
              {!isFullStringVisible ? (
                <span>
                  <span className="cursor-pointer group relative text-green-600">
                    "{data.substring(0, 100)}..."
                    {/* Medium view on hover */}
                    <span
                      className="hidden group-hover:block absolute z-10 bg-gray-100 border border-gray-300 rounded p-2 shadow-lg"
                      style={{
                        maxWidth: "80vw",
                        maxHeight: "200px",
                        overflowY: "auto",
                        whiteSpace: "pre-wrap",
                        left: "0",
                        top: "100%",
                      }}
                    >
                      <span className="text-green-600">
                        "{data.substring(0, 400)}..."
                      </span>
                    </span>
                  </span>

                  <a
                    href="#"
                    className="ml-2 text-blue-500 hover:text-blue-700 hover:underline"
                    onClick={toggleStringView}
                  >
                    Show All
                  </a>
                </span>
              ) : (
                <div className="block">
                  <div className="flex justify-between items-center mb-2">
                    <a
                      href="#"
                      className="text-blue-500 hover:text-blue-700 hover:underline"
                      onClick={toggleStringView}
                    >
                      Collapse
                    </a>
                  </div>
                  <pre
                    className="text-green-600 whitespace-pre-wrap break-all"
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                      maxWidth: "80vw",
                    }}
                  >
                    "{data}"
                  </pre>
                </div>
              )}
            </div>
          );
        } else {
          // For normal strings
          return (
            <div style={nodeIndentStyle} className="py-1">
              <span className="text-purple-600">{name}: </span>
              <span className="text-green-600">"{data}"</span>
            </div>
          );
        }

      case "number":
        return (
          <div style={nodeIndentStyle} className="py-1">
            <span className="text-purple-600">{name}: </span>
            <span className="text-blue-600">{data}</span>
          </div>
        );

      case "boolean":
        return (
          <div style={nodeIndentStyle} className="py-1">
            <span className="text-purple-600">{name}: </span>
            <span className="text-orange-600">{data.toString()}</span>
          </div>
        );

      case "null":
        return (
          <div style={nodeIndentStyle} className="py-1">
            <span className="text-purple-600">{name}: </span>
            <span className="text-gray-600">null</span>
          </div>
        );

      default:
        return (
          <div style={nodeIndentStyle} className="py-1">
            <span className="text-purple-600">{name}: </span>
            <span className="text-gray-600">{String(data)}</span>
          </div>
        );
    }
  };

  return <div className="json-node">{renderContent()}</div>;
};

// Sample data for demo purposes
const sampleData = {
  id: 1,
  name: "Sample JSON",
  active: true,
  details: {
    description: "This is a sample JSON for demonstration",
    longText:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\n"This is a quoted section with "nested quotes" inside it."\n\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\n"Another quoted section."\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'.repeat(
        10
      ),
    stats: [1, 2, 3, 4, 5],
    nested: {
      level1: {
        level2: {
          level3: {
            deep: "You've gone too deep!",
          },
        },
      },
    },
  },
  tags: ["json", "viewer", "react", "component"],
  nullValue: null,
};

// Create and export the web component
class JSONViewerElement extends HTMLElement {
  _shadowRoot: ShadowRoot;
  _reactRoot: ReactDOM.Root;

  constructor() {
    super();
    // Create shadow root
    this._shadowRoot = this.attachShadow({ mode: "open" });

    // Create style element and inject Tailwind styles
    const style = document.createElement("style");
    style.textContent = tailwindStyles;
    this._shadowRoot.appendChild(style);

    // Create mount point for React
    const mountPoint = document.createElement("div");
    this._shadowRoot.appendChild(mountPoint);
    this._reactRoot = ReactDOM.createRoot(mountPoint);

    // Render React component
    this._reactRoot.render(
      <JSONViewer data={JSON.parse(this.getAttribute("data") || "{}")} />
    );
  }

  // Handle attribute changes
  static get observedAttributes() {
    return ["data"];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "data" && this._reactRoot) {
      this._reactRoot.render(
        <JSONViewer data={JSON.parse(newValue || "{}")} />
      );
    }
  }
}

// Register the web component
customElements.define("json-viewer", JSONViewerElement);

export default JSONViewer;
export { JSONViewer, JSONNode, JSONViewerElement };
