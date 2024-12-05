import {
  CallToolRequest,
  CallToolResult,
  ContentType,
  ListResourceTemplatesResult,
  ListResourcesResult,
  ReadResourceRequest,
  ReadResourceResult,
  ResourceTemplate,
  ToolDescription,
} from "./pdk";

/**
 * Called when the tool is invoked.
 *
 * @param {CallToolRequest} input - The incoming tool request from the LLM
 * @returns {CallToolResult} The servlet's response to the given tool call
 */
export function callImpl(input: CallToolRequest): CallToolResult {

  return {
    content: [
      {
        type: ContentType.Text,
        text: `Hello, there are more notes available. Use the list_resources and read_resource endpoints to get the notes. The list_resources endpoint will give you the root folder, and the read_resource endpoint will give you the contents of the notes. The scheme is simple_resource. An example URI is simple_resource://root/Folder 1/note1`,
      }
    ]
  }
}



/**
 * Called by mcpx to understand how and why to use this tool
 *
 * @returns {ToolDescription} The tool's description
 */
export function describeImpl(): ToolDescription {
  return {
    name: "simple_resource",
    description: "I can give you access to the User's notes. Use the list_resources and read_resource endpoints to get the notes. The list_resources endpoint will give you the root folder, and the read_resource endpoint will give you the contents of the notes. The scheme is simple_resource",
    inputSchema: {
      type: "object",
      properties: {
        uri: {
          type: "string",
          description: "The URI of the resource to read",
        },
      }
    },
  };
}

type Note = {
  name: string;
  title: string;
  content: string;
};

type Folder = {
  name: string;
  entries: (Folder | Note)[];
}

const ALL_RESOURCES: Folder = {
  name: "root",
  entries: [
    {
      name: "Folder 1",
      entries: [
        {
          name: "note1",
          title: "Note 1",
          content: "This is a note",
        },
        {
          name: "note2",
          title: "Note 2",
          content: "This is another note",
        },
      ],
    },
    {
      name: "Folder 2",
      entries: [
        {
          name: "note3",
          title: "Note 3",
          content: "This is a third note",
        },
      ],
    },
  ],
}

/**
 * Called by mcpx to list the resource templates available from the Servlet
 *
 * @returns {ListResourceTemplatesResult} The list of resource templates available from the Servlet
 */
export function list_resource_templatesImpl(): ListResourceTemplatesResult {
  return {
    resourceTemplates: [
      {
        name: "note template",
        description: "A template for a note resource",
        mimeType: "text/plain",
        uriTemplate: "simple_resource://{path}/{id}",
      },
      {
        name: "folder template",
        description: "A template for a folder resource. Returns a list of notes and folders",
        mimeType: "application/json",
        uriTemplate: "simple_resource://{path}/{name}",
      },
    ]
  }
}

/**
 * Called by mcpx to list the resources available from the Servlet
 *
 * @returns {ListResourcesResult} The list of resources available from the Servlet
 */
export function list_resourcesImpl(): ListResourcesResult {
  const uri = "simple_resource://root";

  return {
    resources: [
      {
        uri,
        name: "root",
        description: "The root folder",
        mimeType: "application/json",
      },
    ],
  };
}

/**
 * Called by mcpx to read a resource
 *
 * @param {ReadResourceRequest} input - The incoming resource request from the LLM
 * @returns {ReadResourceResult} The servlet's response to the given resource request
 */
export function read_resourceImpl(
  input: ReadResourceRequest,
): ReadResourceResult {
  const uri = input.params?.uri!;

  const resource = findResource(ALL_RESOURCES, uri);

  if (!resource) {
    throw new Error(`Resource not found: ${uri}`);
  }

  return {
    contents: [{
      uri: uri,
      text: JSON.stringify(resource, null, 2),
      mimeType: "application/json",
    }]
  };
}

function findResource(folder: Folder, uri: string): Folder | Note | undefined {
  // Handle the root folder case
  if (uri === "simple_resource://root") {
    return folder;
  }

  // Extract the path from the URI
  const parts = uri.replace("simple_resource://root/", "").split("/");

  let current: Folder = folder;

  // Navigate through the folder structure
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Look for matching entry in current folder
    const entry = current.entries.find(entry => {
      // For both folders and notes, we now look for the name property
      return entry.name === part;
    });

    if (!entry) {
      return undefined;
    }

    // If this is the last part of the path, return the entry
    if (i === parts.length - 1) {
      return entry;
    }

    // If we need to go deeper but hit a note, path is invalid
    if (!(entry as Folder).entries) {
      return undefined;
    }

    // Continue traversing with the next folder
    current = entry as Folder;
  }

  return undefined;
}