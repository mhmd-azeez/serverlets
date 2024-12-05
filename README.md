# Serverlets

```
# updated
# yaml-language-server: $schema=https://xtp.dylibso.com/assets/wasm/schema.json
version: v1-draft
exports:
  describe:
    description: Called by mcpx to understand how and why to use this tool
    output:
      description: The tool's description
      $ref: "#/components/schemas/ToolDescription"
      contentType: application/json
    codeSamples:
      - lang: typescript
        label: Description of a simple greeting tool that greets someone by name
        source: |
          return {
            name: "greet",
            description: "A very simple tool to provide a greeting",
            inputSchema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "the name of the person to greet",
                }
              },
              required: ["name"],
            },
          }
  call:
    description: Called when the tool is invoked.
    input:
      description: The incoming tool request from the LLM
      $ref: "#/components/schemas/CallToolRequest"
      contentType: application/json
    output:
      description: The servlet's response to the given tool call
      $ref: "#/components/schemas/CallToolResult"
      contentType: application/json
  list_resources:
    description: Called by mcpx to list the resources available from the Servlet
    output:
      description: The list of resources available from the Servlet
      $ref: "#/components/schemas/ListResourcesResult"
      contentType: application/json
  list_resource_templates:
    description: Called by mcpx to list the resource templates available from the Servlet
    output:
      description: The list of resource templates available from the Servlet
      $ref: "#/components/schemas/ListResourceTemplatesResult"
      contentType: application/json
  read_resource:
    description: Called by mcpx to read a resource
    input:
      description: The incoming resource request from the LLM
      $ref: "#/components/schemas/ReadResourceRequest"
      contentType: application/json
    output:
      description: The servlet's response to the given resource request
      $ref: "#/components/schemas/ReadResourceResult"
      contentType: application/json

components:
  schemas:
    ListResourceRequest:
      description: Used by the client to request a list of resources from the server.
      properties:
        method:
          type: string
        params:
          $ref: "#/components/schemas/ListResouceRequestParams"

    ListResouceRequestParams:
      properties:
        cursor:
          type: string
        _meta:
          description: >-
            This request property is reserved by the protocol to allow clients
            and servers to attach additional metadata to their requests.
          type: object

    ListResourcesResult:
      description: The server's response to a list_resources call.
      properties:
        resources:
          type: array
          items:
            $ref: "#/components/schemas/Resource"
        nextCursor:
          type: string
      required:
        - resources

    Resource:
      description: A resource available from the server.
      properties:
        name:
          description: |
            A human-readable name for this resource.
            This can be used by clients to populate UI elements.
          type: string
        description:
          description: >
            A description of what this resource represents.

            This can be used by clients to improve the LLM's understanding of
            available resources. It can be thought of like a "hint" to the
            model.
          type: string
        uri:
          description: The URI of the resource.
          type: string
        mimeType:
          description: "The MIME type of the resource, if known."
          type: string
      required:
        - name
        - uri

    ListResourceTemplatesRequst:
      description: >-
        Used by the client to request a list of resource templates from the
        server.
      properties:
        method:
          type: string
        params:
          $ref: "#/components/schemas/ListResourceTemplatesRequestParams"

    ListResourceTemplatesRequestParams:
      properties:
        cursor:
          type: string
        _meta:
          description: >-
            This request property is reserved by the protocol to allow clients
            and servers to attach additional metadata to their requests.
          type: object

    ListResourceTemplatesResult:
      description: The server's response to a list_resource_templates call.
      properties:
        resourceTemplates:
          type: array
          items:
            $ref: "#/components/schemas/ResourceTemplate"
        nextCursor:
          type: string
      required:
        - resourceTemplates

    ResourceTemplate:
      description: A template for a resource that can be created by the server.
      properties:
        name:
          description: >
            A human-readable name for the type of resource this template refers
            to.

            This can be used by clients to populate UI elements.
          type: string
        uriTemplate:
          description: >-
            A URI template (according to RFC 6570) that can be used to construct
            resource URIs.
          type: string
        description:
          description: A description of what this resource template represents.
          type: string
        mimeType:
          description: "The MIME type of the resource, if known."
          type: string
      required:
        - name
        - uriTemplate

    ReadResourceRequest:
      description: Used by the client to request a resource from the server.
      properties:
        method:
          type: string
        params:
          $ref: "#/components/schemas/ReadResourceRequestParams"

    ReadResourceRequestParams:
      properties:
        uri:
          description: The URI of the resource to read.
          type: string
        _meta:
          description: >-
            This request property is reserved by the protocol to allow clients
            and servers to attach additional metadata to their requests.
          type: object

    ReadResourceResult:
      description: The server's response to reading a resource.
      properties:
        _meta:
          description: >-
            This result property is reserved by the protocol to allow clients
            and servers to attach additional metadata to their responses.
          type: object
        contents:
          type: array
          items:
            $ref: "#/components/schemas/ResourceContents"
        isError:
          description: |-
            Whether the tool call ended in an error.
            If not set, this is assumed to be false.
          type: boolean
      required:
        - contents

    ResourceContents:
      properties:
        uri:
          type: string
        mimeType:
          type: string
        text:
          type: string
        blob:
          type: string
          format: byte
      required:
        - uri

    ToolDescription:
      description: Tells mcpx
      properties:
        name:
          description: The name of the tool. It should match the plugin / binding name.
          type: string
        description:
          description: A description of the tool
          type: string
        inputSchema:
          description: The JSON schema describing the argument input
          type: object
      required:
        - name
        - description
        - inputSchema

    CallToolRequest:
      description: Used by the client to invoke a tool provided by the server.
      properties:
        method:
          type: string
        params:
          $ref: "#/components/schemas/Params"
      required:
        - params

    Params:
      properties:
        arguments:
          type: object
        name:
          type: string
      required:
        - name

    CallToolResult:
      description: >
        The server's response to a tool call.


        Any errors that originate from the tool SHOULD be reported inside the result

        object, with `isError` set to true, _not_ as an MCP protocol-level error

        response. Otherwise, the LLM would not be able to see that an error occurred

        and self-correct.


        However, any errors in _finding_ the tool, an error indicating that the

        server does not support tool calls, or any other exceptional conditions,

        should be reported as an MCP error response.
      properties:
        _meta:
          description: >-
            This result property is reserved by the protocol to allow clients
            and servers to attach additional metadata to their responses.
          type: object
        content:
          type: array
          items:
            $ref: "#/components/schemas/Content"
        isError:
          description: |-
            Whether the tool call ended in an error.
            If not set, this is assumed to be false.
          type: boolean
      required:
        - content

    Content:
      description: >
        A content response.
        For text content set type to ContentType.Text and set the `text` property
        For image content set type to ContentType.Image and set the `data` and
        `mimeType` properties
        For resource content set type to ContentType.Resource and set the `uri` + `text` or `blob` property
      properties:
        type:
          $ref: "#/components/schemas/ContentType"
        text:
          description: The text content of the message.
          type: string
        data:
          description: The base64-encoded image data.
          type: string
          format: byte
        mimeType:
          description: >-
            The MIME type of the image or resource. Different providers may
            support different types.
          type: string
        Resource:
          $ref: "#/components/schemas/EmbeddedResourceContents"
        annotations:
          $ref: "#/components/schemas/TextAnnotation"
      required:
        - type
    ContentType:
      enum:
        - text
        - image
        - resource

    TextAnnotation:
      description: A text annotation
      properties:
        audience:
          description: >-
            Describes who the intended customer of this object or data is.
            It can include multiple entries to indicate content useful for
            multiple audiences (e.g., `["user", "assistant"]`).
          type: array
          items:
            $ref: "#/components/schemas/Role"
        priority:
          description: >-
            Describes how important this data is for operating the server.
            A value of 1 means "most important," and indicates that the data is
            effectively required, while 0 means "least important," and indicates
            that the data is entirely optional.
          type: number
          format: float
    Role:
      description: The sender or recipient of messages and data in a conversation.
      enum:
        - assistant
        - user

    EmbeddedResourceContents:
      properties:
        uri:
          description: The URI of the resource.
          type: string
        text:
          $ref: "#/components/schemas/TextResourceContents"
        blob:
          $ref: "#/components/schemas/BlobResourceContents"
      required:
        - uri

    TextResourceContents:
      properties:
        mimeType:
          description: The MIME type of this resource, if known.
          type: string
        text:
          description: The text of the item. This must only be set if the item can actually be represented as text (not binary data).
          type: string
        uri:
          description: The URI of this resource.
          type: string
      required:
        - text
        - uri

    BlobResourceContents:
      properties:
        blob:
          description: A base64-encoded string representing the binary data of the item.
          format: byte
          type: string
        mimeType:
          description: The MIME type of this resource, if known.
          type: string
        uri:
          description: The URI of this resource.
          type: string
      required:
        - blob
        - uri
```
