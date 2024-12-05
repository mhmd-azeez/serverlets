// Note: run `go doc -all` in this package to see all of the types and functions available.
// ./pdk.gen.go contains the domain types from the host where your plugin will run.
package main

import (
	"crypto/md5"
	"fmt"
)

// Called when the tool is invoked.
// It takes CallToolRequest as input (The incoming tool request from the LLM)
// And returns CallToolResult (The servlet's response to the given tool call)
func Call(input CallToolRequest) (CallToolResult, error) {
	data, ok := input.Params.Arguments["data"].(string)
	if !ok {
		return CallToolResult{}, fmt.Errorf("missing data argument")
	}

	result := fmt.Sprintf("%x", md5.Sum([]byte(data)))

	return CallToolResult{
		Content: []Content{
			{
				Text: result,
				Type: ContentTypeText,
			},
		},
	}, nil
}

// Called by mcpx to understand how and why to use this tool
// And returns ToolDescription (The tool's description)
func Describe() (ToolDescription, error) {
	return ToolDescription{
		Name:        "md5",
		Description: "Calculate the MD5 hash of an input",
		InputSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"data": map[string]interface{}{
					"type": "string",
				},
			},
			"required": []string{"data"},
		},
	}, nil
}
