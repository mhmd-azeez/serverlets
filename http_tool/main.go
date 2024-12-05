// Note: run `go doc -all` in this package to see all of the types and functions available.
// ./pdk.gen.go contains the domain types from the host where your plugin will run.
package main

import (
	"encoding/base64"
	"errors"
	"fmt"

	"github.com/extism/go-pdk"
)

// Called when the tool is invoked.
// It takes CallToolRequest as input (The incoming tool request from the LLM)
// And returns CallToolResult (The servlet's response to the given tool call)
func Call(input CallToolRequest) (CallToolResult, error) {
	url, ok := input.Params.Arguments["url"].(string)
	if !ok {
		return CallToolResult{}, errors.New("url is required")
	}

	pdk.Log(pdk.LogError, fmt.Sprintf("url: %s", url))

	method, ok := input.Params.Arguments["method"].(string)
	if !ok {
		method = "GET"
	}

	headers, ok := input.Params.Arguments["headers"].(map[string]interface{})
	if !ok {
		headers = make(map[string]interface{})
	}

	body, ok := input.Params.Arguments["body"].(string)
	if !ok {
		body = ""
	}

	req := pdk.NewHTTPRequest(toHttpMethod(method), url)
	for k, v := range headers {
		req.SetHeader(k, v.(string))
	}

	if len(body) > 0 {
		bytes, err := base64.StdEncoding.DecodeString(body)
		if err != nil {
			return CallToolResult{}, err
		}

		req.SetBody(bytes)
	}

	resp := req.Send()

	responseBody := string(resp.Body())
	// responseHeaders := resp.Headers()

	// responseHeadersJson, err := json.Marshal(responseHeaders)
	// if err != nil {
	// 	return CallToolResult{}, err
	// }

	responseStatusCode := resp.Status()

	return CallToolResult{
		Content: []Content{
			{
				Type: ContentTypeText,
				Text: responseBody,
			},
			// {
			// 	Data:     string(responseHeadersJson),
			// 	MimeType: "application/json",
			// },
			{
				Type: ContentTypeText,
				Text: fmt.Sprintf("%v", responseStatusCode),
			},
		},
	}, nil
}

func toHttpMethod(method string) pdk.HTTPMethod {
	switch method {
	case "GET":
		return pdk.MethodGet
	case "POST":
		return pdk.MethodPost
	case "PUT":
		return pdk.MethodPut
	case "DELETE":
		return pdk.MethodDelete
	case "PATCH":
		return pdk.MethodPatch
	case "HEAD":
		return pdk.MethodHead
	case "OPTIONS":
		return pdk.MethodOptions
	default:
		return pdk.MethodGet
	}
}

// Called by mcpx to understand how and why to use this tool
// And returns ToolDescription (The tool's description)
func Describe() (ToolDescription, error) {
	return ToolDescription{
		Name:        "http",
		Description: "Makes an HTTP request and returns the response",
		InputSchema: map[string]interface{}{
			"type": "object",
			"properties": map[string]interface{}{
				"url": map[string]interface{}{
					"type": "string",
				},
				"method": map[string]interface{}{
					"type": "string",
				},
				"headers": map[string]interface{}{
					"type": "object",
					"additionalProperties": map[string]interface{}{
						"type": "string",
					},
				},
				"body": map[string]interface{}{
					"type":        "string",
					"description": "Base64 encoded body",
				},
			},
			"required": []string{"url"},
		},
	}, nil
}
