# Summary

| Method                                                      | REST   | URL                    | Request                             | Response                              |
|-------------------------------------------------------------|--------|------------------------|-------------------------------------|---------------------------------------|
| [Create new file/dir](#create-new-file-or-directory)        | POST   | api/files              | {<br />&nbsp;&nbsp;parentId,<br />&nbsp;&nbsp;type,<br />&nbsp;&nbsp;?name,<br />&nbsp;&nbsp;?files<br />} | :file-stats-resource<br />or<br />[... :file-stats-resource]                  |
| [Get dir stats](#get-file-or-directory-statistics) for root | GET    | api/files              | -                                   | :file-stats-resource                  |
| [Get file/dir stats](#get-file-or-directory-statistics)     | GET    | api/files/:id          | -                                   | :file-stats-resource                  |
| [Delete file/dir](#delete-file-or-directory)                | DELETE | api/files/:id          | -                                   | -                                     |
| [Get dir children list](#get-directory-children-list)       | GET    | api/files/:id/children | {<br />&nbsp;&nbsp;orderBy,<br />&nbsp;&nbsp;orderDirection,<br />&nbsp;&nbsp;maxResults,<br />&nbsp;&nbsp;pageToken,<br />&nbsp;&nbsp;searchQuery,<br />&nbsp;&nbsp;searchRecursively<br />}    | {<br />&nbsp;&nbsp;items: [... :file-stats-resource],<br />&nbsp;&nbsp;nextPageToken<br />} |
| [Rename and/or copy/move file/dir to destination](#rename-andor-copymove-filedir-to-destination) | PATCH   | api/files/:id    | {<br />&nbsp;&nbsp;?parents: [:id, ...],<br />&nbsp;&nbsp;?name<br />} |  :file-stats-resource |
| [Get file(s)/compressed dir](#get-filescompressed-dir) | GET    | api/download           | <span style="word-wrap: break-word; white-space: pre;">?items=:id&items=:id...</span>                          | :binary-data                          |

NOTE: file/dir ID is its path+name in base64 ([base64url](https://www.npmjs.com/package/base64url)-variation).  There is no trailing slash for dirs. Path starts with slash and relative to a user root dir.

# API

## File stats resource

```javascript
{
  id: <string>,
  name: <string>,
  type: <string>, // "dir" or "file"
  createdTime: <string>,
  modifiedTime: <string>,
  ?size: <string>, // for files only
  ?parentId: <string>, // for non-root only
  md5Checksum: <string>, // TODO in v2
  capabilities: {
    canListChildren: <boolean>,
    canAddChildren: <boolean>,
    canRemoveChildren: <boolean>,
    canDelete: <boolean>,
    canRename: <boolean>,
    canCopy: <boolean>,
    caEdit: <boolean>,
    canDownload: <boolean>
  }
}
```

## Create new file or directory

* URL: `api/files`
* Method: POST
* Content-Type: multipart/form-data

### Request

FormData instance with the following field name/value pairs.

| Field Name | Field Value  | Comments               |
|------------|--------------|------------------------|
|  parentId  | \<string\>   |                        |
|  type      | \<string\>   |                        |
| ?name      | \<string\>   | for type 'dir' only  |
| ?files     | \<FileList\> | for type 'file' only |

### Response

For directory creation:

```javascript
<file stats resource>
```

For file(s) upload:

```javascript
[<file stats resource>, ...]
```

A 204 status is returned if a dir with parentId does not exist.

## Delete file or directory

* URL: `api/files/id`
* Method: DELETE

### Request

None.

### Response

If successful, this method returns an empty response body.

## Get directory children list

* URL: `api/files/:id/children`
* Method: GET

### Request

```javascript
{
  orderBy: <string>, // one of 'createdDate', 'folder', 'modifiedDate', 'quotaBytesUsed', 'name'.
  orderDirection: <string>, // ASC/DESC
  maxResults: <number>, // TODO in v2
  pageToken: <string>, // TODO in v2
  searchQuery: <string>, // TODO in v2
  searchRecursively: <bool> // TODO in v2
}
```

### Response

```javascript
{
  items: [<file stats resource>, ...],
  nextPageToken // TODO in v2
}
```

## Get file or directory statistics

* URL: `api/files/:id`
* Method: GET

### Request

None.

### Response

```
<file stats resource>
```

## Get file(s)/compressed dir

* URL: `api/download?items=:id&items=:id...`
* Method: GET

### Request

When multiple items, all _must_ be from the same folder.  Both folder and file ids are allowed in __items__ array.

### Response

* Content-Type: application/zip
* Content-Disposition: attachment; filename="\<string\>"

Binary data.

## Rename and/or copy/move file/dir to destination

* URL: `api/files/:id`
* Method: PATCH

### Request

```javascript
{
  ?parents: [<string>, ...],
  ?name: <string>
}
```

When moving a file/dir, **parents** array has destination parent ID only.  **name**, if specified, gives a new name in destination.

When copying a file/dir, **parents** array has both current parent ID and destination parent ID (order is irrelevant).  **name**, if specified, gives a new name in destination.  When copying inside parent dir, **parents** array may have either one parent ID or parent ID repeated twice.

When renaming a file/dir, **parents** parameter is not set or empty array.

If target exists, the file/dir is copied/moved with suffix ` (<number>)`, where number is tried with 1, 2, etc. untill first free name is found.

### Response

```
<file stats resource>
```

# Error

In case of an error, HTTP response is sent with error status code and empty body.  Available HTTP error status codes:

* 400
* 403
* 410
* 500
