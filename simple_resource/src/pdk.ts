function isNull(v: any): boolean {
  return v === undefined || v === null;
}

function cast(caster: (v: any) => any, v: any): any {
  if (isNull(v)) return v;
  return caster(v);
}

function castArray(caster: (v: any) => any) {
  return (v?: Array<any>) => {
    if (isNull(v)) return v;
    caster = cast.bind(null, caster); // bind to null-preserving logic in `cast`
    return v!.map(caster);
  };
}

function castMap(caster: (v: any) => any) {
  return (v?: any) => {
    if (isNull(v)) return v;

    caster = cast.bind(null, caster); // bind to null-preserving logic in `cast`
    const newMap: any = {};
    for (const k in v) {
      newMap[k] = caster(v![k]);
    }
    return newMap;
  };
}

function dateToJson(v?: Date): string | undefined | null {
  if (v === undefined || v === null) return v;
  return v.toISOString();
}
function dateFromJson(v?: string): Date | undefined | null {
  if (v === undefined || v === null) return v;
  return new Date(v);
}

function bufferToJson(v?: ArrayBuffer): string | undefined | null {
  if (v === undefined || v === null) return v;
  return Host.arrayBufferToBase64(v);
}
function bufferFromJson(v?: string): ArrayBuffer | undefined | null {
  if (v === undefined || v === null) return v;
  return Host.base64ToArrayBuffer(v);
}

/**
 *
 */
export class BlobResourceContents {
  /**
   * A base64-encoded string representing the binary data of the item.
   */
  // @ts-expect-error TS2564
  blob: string;

  /**
   * The MIME type of this resource, if known.
   */
  mimeType?: string;

  /**
   * The URI of this resource.
   */
  // @ts-expect-error TS2564
  uri: string;

  static fromJson(obj: any): BlobResourceContents {
    return {
      ...obj,
    };
  }

  static toJson(obj: BlobResourceContents): any {
    return {
      ...obj,
    };
  }
}

/**
 * Used by the client to invoke a tool provided by the server.
 */
export class CallToolRequest {
  method?: string;

  // @ts-expect-error TS2564
  params: Params;

  static fromJson(obj: any): CallToolRequest {
    return {
      ...obj,
      params: cast(Params.fromJson, obj.params),
    };
  }

  static toJson(obj: CallToolRequest): any {
    return {
      ...obj,
      params: cast(Params.toJson, obj.params),
    };
  }
}

/**
 * The server's response to a tool call.
 *
 * Any errors that originate from the tool SHOULD be reported inside the result
 * object, with `isError` set to true, _not_ as an MCP protocol-level error
 * response. Otherwise, the LLM would not be able to see that an error occurred
 * and self-correct.
 *
 * However, any errors in _finding_ the tool, an error indicating that the
 * server does not support tool calls, or any other exceptional conditions,
 * should be reported as an MCP error response.
 */
export class CallToolResult {
  /**
   * This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.
   */
  _meta?: any;

  // @ts-expect-error TS2564
  content: Array<Content>;

  /**
   * Whether the tool call ended in an error.
   * If not set, this is assumed to be false.
   */
  isError?: boolean;

  static fromJson(obj: any): CallToolResult {
    return {
      ...obj,
      content: cast(castArray(Content.fromJson), obj.content),
    };
  }

  static toJson(obj: CallToolResult): any {
    return {
      ...obj,
      content: cast(castArray(Content.toJson), obj.content),
    };
  }
}

/**
 * A content response. For text content set type to ContentType.Text and set the `text` property For image content set type to ContentType.Image and set the `data` and `mimeType` properties For resource content set type to ContentType.Resource and set the `uri` + `text` or `blob` property
 */
export class Content {
  Resource?: EmbeddedResourceContents;

  annotations?: TextAnnotation;

  /**
   * The base64-encoded image data.
   */
  data?: string;

  /**
   * The MIME type of the image or resource. Different providers may support different types.
   */
  mimeType?: string;

  /**
   * The text content of the message.
   */
  text?: string;

  // @ts-expect-error TS2564
  type: ContentType;

  static fromJson(obj: any): Content {
    return {
      ...obj,
      Resource: cast(EmbeddedResourceContents.fromJson, obj.Resource),
      annotations: cast(TextAnnotation.fromJson, obj.annotations),
    };
  }

  static toJson(obj: Content): any {
    return {
      ...obj,
      Resource: cast(EmbeddedResourceContents.toJson, obj.Resource),
      annotations: cast(TextAnnotation.toJson, obj.annotations),
    };
  }
}

/**
 *
 */
export enum ContentType {
  Text = "text",
  Image = "image",
  Resource = "resource",
}

/**
 *
 */
export class EmbeddedResourceContents {
  blob?: BlobResourceContents;

  text?: TextResourceContents;

  /**
   * The URI of the resource.
   */
  // @ts-expect-error TS2564
  uri: string;

  static fromJson(obj: any): EmbeddedResourceContents {
    return {
      ...obj,
      blob: cast(BlobResourceContents.fromJson, obj.blob),
      text: cast(TextResourceContents.fromJson, obj.text),
    };
  }

  static toJson(obj: EmbeddedResourceContents): any {
    return {
      ...obj,
      blob: cast(BlobResourceContents.toJson, obj.blob),
      text: cast(TextResourceContents.toJson, obj.text),
    };
  }
}

/**
 *
 */
export class ListResouceRequestParams {
  /**
   * This request property is reserved by the protocol to allow clients and servers to attach additional metadata to their requests.
   */
  _meta?: any;

  cursor?: string;

  static fromJson(obj: any): ListResouceRequestParams {
    return {
      ...obj,
    };
  }

  static toJson(obj: ListResouceRequestParams): any {
    return {
      ...obj,
    };
  }
}

/**
 * Used by the client to request a list of resources from the server.
 */
export class ListResourceRequest {
  method?: string;

  params?: ListResouceRequestParams;

  static fromJson(obj: any): ListResourceRequest {
    return {
      ...obj,
      params: cast(ListResouceRequestParams.fromJson, obj.params),
    };
  }

  static toJson(obj: ListResourceRequest): any {
    return {
      ...obj,
      params: cast(ListResouceRequestParams.toJson, obj.params),
    };
  }
}

/**
 *
 */
export class ListResourceTemplatesRequestParams {
  /**
   * This request property is reserved by the protocol to allow clients and servers to attach additional metadata to their requests.
   */
  _meta?: any;

  cursor?: string;

  static fromJson(obj: any): ListResourceTemplatesRequestParams {
    return {
      ...obj,
    };
  }

  static toJson(obj: ListResourceTemplatesRequestParams): any {
    return {
      ...obj,
    };
  }
}

/**
 * Used by the client to request a list of resource templates from the server.
 */
export class ListResourceTemplatesRequst {
  method?: string;

  params?: ListResourceTemplatesRequestParams;

  static fromJson(obj: any): ListResourceTemplatesRequst {
    return {
      ...obj,
      params: cast(ListResourceTemplatesRequestParams.fromJson, obj.params),
    };
  }

  static toJson(obj: ListResourceTemplatesRequst): any {
    return {
      ...obj,
      params: cast(ListResourceTemplatesRequestParams.toJson, obj.params),
    };
  }
}

/**
 * The server's response to a list_resource_templates call.
 */
export class ListResourceTemplatesResult {
  nextCursor?: string;

  // @ts-expect-error TS2564
  resourceTemplates: Array<ResourceTemplate>;

  static fromJson(obj: any): ListResourceTemplatesResult {
    return {
      ...obj,
      resourceTemplates: cast(
        castArray(ResourceTemplate.fromJson),
        obj.resourceTemplates,
      ),
    };
  }

  static toJson(obj: ListResourceTemplatesResult): any {
    return {
      ...obj,
      resourceTemplates: cast(
        castArray(ResourceTemplate.toJson),
        obj.resourceTemplates,
      ),
    };
  }
}

/**
 * The server's response to a list_resources call.
 */
export class ListResourcesResult {
  nextCursor?: string;

  // @ts-expect-error TS2564
  resources: Array<Resource>;

  static fromJson(obj: any): ListResourcesResult {
    return {
      ...obj,
      resources: cast(castArray(Resource.fromJson), obj.resources),
    };
  }

  static toJson(obj: ListResourcesResult): any {
    return {
      ...obj,
      resources: cast(castArray(Resource.toJson), obj.resources),
    };
  }
}

/**
 *
 */
export class Params {
  arguments?: any;

  // @ts-expect-error TS2564
  name: string;

  static fromJson(obj: any): Params {
    return {
      ...obj,
    };
  }

  static toJson(obj: Params): any {
    return {
      ...obj,
    };
  }
}

/**
 * Used by the client to request a resource from the server.
 */
export class ReadResourceRequest {
  method?: string;

  params?: ReadResourceRequestParams;

  static fromJson(obj: any): ReadResourceRequest {
    return {
      ...obj,
      params: cast(ReadResourceRequestParams.fromJson, obj.params),
    };
  }

  static toJson(obj: ReadResourceRequest): any {
    return {
      ...obj,
      params: cast(ReadResourceRequestParams.toJson, obj.params),
    };
  }
}

/**
 *
 */
export class ReadResourceRequestParams {
  /**
   * This request property is reserved by the protocol to allow clients and servers to attach additional metadata to their requests.
   */
  _meta?: any;

  /**
   * The URI of the resource to read.
   */
  uri?: string;

  static fromJson(obj: any): ReadResourceRequestParams {
    return {
      ...obj,
    };
  }

  static toJson(obj: ReadResourceRequestParams): any {
    return {
      ...obj,
    };
  }
}

/**
 * The server's response to reading a resource.
 */
export class ReadResourceResult {
  /**
   * This result property is reserved by the protocol to allow clients and servers to attach additional metadata to their responses.
   */
  _meta?: any;

  // @ts-expect-error TS2564
  contents: Array<ResourceContents>;

  /**
   * Whether the tool call ended in an error.
   * If not set, this is assumed to be false.
   */
  isError?: boolean;

  static fromJson(obj: any): ReadResourceResult {
    return {
      ...obj,
      contents: cast(castArray(ResourceContents.fromJson), obj.contents),
    };
  }

  static toJson(obj: ReadResourceResult): any {
    return {
      ...obj,
      contents: cast(castArray(ResourceContents.toJson), obj.contents),
    };
  }
}

/**
 * A resource available from the server.
 */
export class Resource {
  /**
   * A description of what this resource represents.
   * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
   */
  description?: string;

  /**
   * The MIME type of the resource, if known.
   */
  mimeType?: string;

  /**
   * A human-readable name for this resource.
   * This can be used by clients to populate UI elements.
   */
  // @ts-expect-error TS2564
  name: string;

  /**
   * The URI of the resource.
   */
  // @ts-expect-error TS2564
  uri: string;

  static fromJson(obj: any): Resource {
    return {
      ...obj,
    };
  }

  static toJson(obj: Resource): any {
    return {
      ...obj,
    };
  }
}

/**
 *
 */
export class ResourceContents {
  blob?: string;

  mimeType?: string;

  text?: string;

  // @ts-expect-error TS2564
  uri: string;

  static fromJson(obj: any): ResourceContents {
    return {
      ...obj,
    };
  }

  static toJson(obj: ResourceContents): any {
    return {
      ...obj,
    };
  }
}

/**
 * A template for a resource that can be created by the server.
 */
export class ResourceTemplate {
  /**
   * A description of what this resource template represents.
   */
  description?: string;

  /**
   * The MIME type of the resource, if known.
   */
  mimeType?: string;

  /**
   * A human-readable name for the type of resource this template refers to.
   * This can be used by clients to populate UI elements.
   */
  // @ts-expect-error TS2564
  name: string;

  /**
   * A URI template (according to RFC 6570) that can be used to construct resource URIs.
   */
  // @ts-expect-error TS2564
  uriTemplate: string;

  static fromJson(obj: any): ResourceTemplate {
    return {
      ...obj,
    };
  }

  static toJson(obj: ResourceTemplate): any {
    return {
      ...obj,
    };
  }
}

/**
 * The sender or recipient of messages and data in a conversation.
 */
export enum Role {
  Assistant = "assistant",
  User = "user",
}

/**
 * A text annotation
 */
export class TextAnnotation {
  /**
   * Describes who the intended customer of this object or data is. It can include multiple entries to indicate content useful for multiple audiences (e.g., `["user", "assistant"]`).
   */
  audience?: Array<Role>;

  /**
   * Describes how important this data is for operating the server. A value of 1 means "most important," and indicates that the data is effectively required, while 0 means "least important," and indicates that the data is entirely optional.
   */
  priority?: number;

  static fromJson(obj: any): TextAnnotation {
    return {
      ...obj,
    };
  }

  static toJson(obj: TextAnnotation): any {
    return {
      ...obj,
    };
  }
}

/**
 *
 */
export class TextResourceContents {
  /**
   * The MIME type of this resource, if known.
   */
  mimeType?: string;

  /**
   * The text of the item. This must only be set if the item can actually be represented as text (not binary data).
   */
  // @ts-expect-error TS2564
  text: string;

  /**
   * The URI of this resource.
   */
  // @ts-expect-error TS2564
  uri: string;

  static fromJson(obj: any): TextResourceContents {
    return {
      ...obj,
    };
  }

  static toJson(obj: TextResourceContents): any {
    return {
      ...obj,
    };
  }
}

/**
 * Tells mcpx
 */
export class ToolDescription {
  /**
   * A description of the tool
   */
  // @ts-expect-error TS2564
  description: string;

  /**
   * The JSON schema describing the argument input
   */
  inputSchema: any;

  /**
   * The name of the tool. It should match the plugin / binding name.
   */
  // @ts-expect-error TS2564
  name: string;

  static fromJson(obj: any): ToolDescription {
    return {
      ...obj,
    };
  }

  static toJson(obj: ToolDescription): any {
    return {
      ...obj,
    };
  }
}
