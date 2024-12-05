import * as main from "./main";

import {
  CallToolRequest,
  CallToolResult,
  ListResourceTemplatesResult,
  ListResourcesResult,
  ReadResourceRequest,
  ReadResourceResult,
  ToolDescription,
} from "./pdk";

export function call(): number {
  const untypedInput = JSON.parse(Host.inputString());
  const input = CallToolRequest.fromJson(untypedInput);

  const output = main.callImpl(input);

  const untypedOutput = CallToolResult.toJson(output);
  Host.outputString(JSON.stringify(untypedOutput));

  return 0;
}

export function describe(): number {
  const output = main.describeImpl();

  const untypedOutput = ToolDescription.toJson(output);
  Host.outputString(JSON.stringify(untypedOutput));

  return 0;
}

export function list_resource_templates(): number {
  const output = main.list_resource_templatesImpl();

  const untypedOutput = ListResourceTemplatesResult.toJson(output);
  Host.outputString(JSON.stringify(untypedOutput));

  return 0;
}

export function list_resources(): number {
  const output = main.list_resourcesImpl();

  const untypedOutput = ListResourcesResult.toJson(output);
  Host.outputString(JSON.stringify(untypedOutput));

  return 0;
}

export function read_resource(): number {
  const untypedInput = JSON.parse(Host.inputString());
  const input = ReadResourceRequest.fromJson(untypedInput);

  const output = main.read_resourceImpl(input);

  const untypedOutput = ReadResourceResult.toJson(output);
  Host.outputString(JSON.stringify(untypedOutput));

  return 0;
}
