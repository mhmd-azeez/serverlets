// Note: run `go doc -all` in this package to see all of the types and functions available.
// ./pdk.gen.go contains the domain types from the host where your plugin will run.
package main

import (
	"encoding/base64"
	"encoding/json"
	"os"
	"strings"
)

// Called when the tool is invoked.
// It takes CallToolRequest as input (The incoming tool request from the LLM)
// And returns CallToolResult (The servlet's response to the given tool call)
func Call(input CallToolRequest) (CallToolResult, error) {
	txt := "This tool cant do much, but you should use Resource Templates to get the file system."
	return CallToolResult{
		Content: []Content{
			{
				Text: &txt,
			},
		},
	}, nil
}

// Called by mcpx to understand how and why to use this tool
// And returns ToolDescription (The tool's description)
func Describe() (ToolDescription, error) {
	return ToolDescription{
		Name:        "File System Serverlet",
		Description: "A servlet that provides read-only access to the file system. It can be used to read files and directories. Use Resources instead of Tools to get the file system.",
		InputSchema: interface{}(nil),
	}, nil
}

// Called by mcpx to list the resource templates available from the Servlet
// And returns ListResourceTemplatesResult (The list of resource templates available from the Servlet)
func ListResourceTemplates() (ListResourceTemplatesResult, error) {
	return ListResourceTemplatesResult{
		ResourceTemplates: []ResourceTemplate{
			{
				Name:        "File or Directory",
				Description: "A file or directory",
				UriTemplate: "filesystem://{absolute_path}",
			},
		},
	}, nil
}

// Called by mcpx to list the resources available from the Servlet
// And returns ListResourcesResult (The list of resources available from the Servlet)
func ListResources() (ListResourcesResult, error) {
	entries, err := os.ReadDir("/mnt")
	if err != nil {
		return ListResourcesResult{}, err
	}

	items := make([]Resource, 0, len(entries))
	fileDesc := "A file or directory"
	fileMimeType := "application/octet-stream"
	dirDesc := "A directory. Read the directory to get the files and subdirectories."
	dirMimeType := "application/json"

	for _, entry := range entries {
		desc := fileDesc
		if entry.IsDir() {
			desc = dirDesc
		}

		mimeType := fileMimeType
		if entry.IsDir() {
			mimeType = dirMimeType
		}

		items = append(items, Resource{
			Name:        entry.Name(),
			Uri:         fullPath(entry.Name(), ""),
			Description: &desc,
			MimeType:    &mimeType,
		})
	}

	return ListResourcesResult{
		Resources: items,
	}, nil
}

// Called by mcpx to read a resource
// It takes ReadResourceRequest as input (The incoming resource request from the LLM)
// And returns ReadResourceResult (The servlet's response to the given resource request)
func ReadResource(input ReadResourceRequest) (ReadResourceResult, error) {
	uri := input.Params.Uri

	// strip scheme
	uri = strings.Split(uri, "://")[1]

	// replace root with current directory
	if strings.HasPrefix(uri, "/") {
		uri = "." + uri
	}

	info, err := os.Stat(uri)
	if err != nil {
		return ReadResourceResult{}, err
	}

	if info.IsDir() {
		entries, err := os.ReadDir(uri)
		if err != nil {
			return ReadResourceResult{}, err
		}

		items := make([]FileSystemEntry, 0, len(entries))
		for _, entry := range entries {
			items = append(items, FileSystemEntry{
				Url:   fullPath(entry.Name(), uri),
				IsDir: entry.IsDir(),
			})
		}

		itemsJson, err := json.Marshal(items)
		if err != nil {
			return ReadResourceResult{}, err
		}

		content := string(itemsJson)
		mimeType := "application/json"

		return ReadResourceResult{
			Content: []Content{
				{
					Text:     &content,
					MimeType: &mimeType,
					Type:     ContentTypeResource,
				},
			},
		}, nil
	}

	file, err := os.ReadFile(uri)
	if err != nil {
		return ReadResourceResult{}, err
	}

	encoded := base64.StdEncoding.EncodeToString(file)
	mimeType := "application/octet-stream"

	return ReadResourceResult{
		Content: []Content{
			{
				Data:     &encoded,
				MimeType: &mimeType,
				Type:     ContentTypeResource,
			},
		},
	}, nil
}

type FileSystemEntry struct {
	Url   string
	IsDir bool
}

func fullPath(name string, dir string) string {
	if dir == "" {
		dir = "/"
	}

	return dir + name
}
