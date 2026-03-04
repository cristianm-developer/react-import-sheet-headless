# Error Codes Reference

This document lists all error codes that can be returned by the headless library.

## Error Structure

All errors follow the `SheetError` interface:

```typescript
interface SheetError {
  readonly code: string;
  readonly params?: Readonly<Record<string, unknown>>;
  readonly level?: 'error' | 'warning' | 'fatal' | 'info';
  readonly message?: string;
  readonly rowIndex?: number;
  readonly cellKey?: string;
}
```

## Global Errors (Parser)

These errors are returned in `useSheetData().errors` when the parser fails before creating a sheet.

### `PARSER_FAILED`

**Level:** `fatal`

**Description:** The parser failed to read or parse the file. This can occur due to:

- Corrupted file
- Unsupported file format
- Invalid file structure
- Worker crash during parsing

**Params:**

- `fileName`: Name of the file that failed to parse
- `fileSize`: Size of the file in bytes
- `fileType`: MIME type of the file
- `originalError`: Original error message from the parser

**Example:**

```json
{
  "code": "PARSER_FAILED",
  "level": "fatal",
  "message": "Failed to parse the file. The file may be corrupted or in an unsupported format.",
  "params": {
    "fileName": "data.csv",
    "fileSize": 1024,
    "fileType": "text/csv",
    "originalError": "Unexpected end of file"
  }
}
```

**How to handle:**

1. Check if the file is corrupted
2. Verify the file format matches the expected type (CSV, XLSX, etc.)
3. Try re-uploading the file
4. Check the `originalError` param for specific details

---

### `PARSER_NO_SHEETS`

**Level:** `fatal`

**Description:** The parser successfully read the file but found no sheets. This can occur when:

- The file is empty
- The file structure is invalid
- All sheets in the workbook are empty

**Params:**

- `fileName`: Name of the file
- `fileSize`: Size of the file in bytes
- `fileType`: MIME type of the file

**Example:**

```json
{
  "code": "PARSER_NO_SHEETS",
  "level": "fatal",
  "message": "No sheets found in the file. The file may be empty or corrupted.",
  "params": {
    "fileName": "empty.xlsx",
    "fileSize": 512,
    "fileType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }
}
```

**How to handle:**

1. Verify the file is not empty
2. Open the file in Excel/LibreOffice to check if it contains data
3. Ensure the file has at least one sheet with data

---

### `PARSER_SHEET_ACCESS_FAILED`

**Level:** `fatal`

**Description:** The parser found sheets in the file but failed to access the first sheet. This is an internal error that should not normally occur.

**Params:**

- `fileName`: Name of the file

**Example:**

```json
{
  "code": "PARSER_SHEET_ACCESS_FAILED",
  "level": "fatal",
  "message": "Failed to access the first sheet in the file.",
  "params": {
    "fileName": "data.xlsx"
  }
}
```

**How to handle:**

1. This is likely a bug in the library
2. Try re-uploading the file
3. If the issue persists, report it as a bug with the file attached

---

## Cell-Level Errors

These errors are attached to specific cells in the sheet (`cell.errors`).

### `INVALID_EMAIL`

**Level:** `error`

**Description:** The cell value is not a valid email address.

**Params:**

- `value`: The invalid value

**Example:**

```json
{
  "code": "INVALID_EMAIL",
  "level": "error",
  "message": "Invalid email address",
  "cellKey": "email",
  "rowIndex": 5,
  "params": {
    "value": "not-an-email"
  }
}
```

---

### `REQUIRED_FIELD_MISSING`

**Level:** `error`

**Description:** A required field is empty or null.

**Params:**

- `fieldName`: Name of the required field

**Example:**

```json
{
  "code": "REQUIRED_FIELD_MISSING",
  "level": "error",
  "message": "This field is required",
  "cellKey": "name",
  "rowIndex": 10,
  "params": {
    "fieldName": "name"
  }
}
```

---

## External Errors (Async Validators/Transforms)

These errors occur when table-level validators or transforms call external APIs.

### `EXTERNAL_VALIDATION_FAILED`

**Level:** `error`

**Description:** An async table-level validator failed to complete due to an external error (network, timeout, server error).

**Params:**

- `reason`: One of `'network'`, `'timeout'`, `'server_error'`

**Example:**

```json
{
  "code": "EXTERNAL_VALIDATION_FAILED",
  "level": "error",
  "message": "External validation failed due to network error",
  "params": {
    "reason": "network"
  }
}
```

**How to handle:**

1. **Network error:** Check internet connection and retry
2. **Timeout:** The request took too long; retry or increase timeout
3. **Server error:** The backend returned an error; check server logs

---

### `EXTERNAL_TRANSFORM_FAILED`

**Level:** `error`

**Description:** An async table-level transform failed to complete due to an external error.

**Params:**

- `reason`: One of `'network'`, `'timeout'`, `'server_error'`

**Example:**

```json
{
  "code": "EXTERNAL_TRANSFORM_FAILED",
  "level": "error",
  "message": "External transform failed due to timeout",
  "params": {
    "reason": "timeout"
  }
}
```

---

## How to Access Errors

### Global Errors (Parser, Worker)

Global errors are available when the status is `error` and no sheet has been created yet:

```typescript
const { errors } = useSheetData();

// When status is 'error' and sheet is null, errors will contain global errors
if (status === 'error' && !sheet && errors.length > 0) {
  const globalError = errors[0];
  console.error(`Parser failed: ${globalError.message}`);
  console.error(`Code: ${globalError.code}`);
  console.error(`Params:`, globalError.params);
}
```

### Sheet Errors (Validation, Transform)

Sheet errors are available when a sheet exists:

```typescript
const { sheet, errors } = useSheetData();

// errors contains both global errors and sheet.errors
if (errors.length > 0) {
  errors.forEach((error) => {
    if (error.rowIndex !== undefined && error.cellKey) {
      console.error(
        `Cell error at row ${error.rowIndex}, column ${error.cellKey}: ${error.message}`
      );
    } else if (error.rowIndex !== undefined) {
      console.error(`Row error at row ${error.rowIndex}: ${error.message}`);
    } else {
      console.error(`Global error: ${error.message}`);
    }
  });
}
```

### Displaying Errors in UI

```typescript
function ErrorDisplay() {
  const { errors, sheet } = useSheetData();
  const { status } = useImporterStatus();

  if (status === 'error' && !sheet) {
    // Fatal error: parser failed
    const fatalError = errors[0];
    return (
      <div className="error-banner">
        <h3>Failed to process file</h3>
        <p>{fatalError?.message}</p>
        {fatalError?.code === 'PARSER_FAILED' && (
          <p>Please check that the file is not corrupted and is in a supported format (CSV, XLSX).</p>
        )}
      </div>
    );
  }

  if (errors.length > 0) {
    // Validation errors
    return (
      <div className="validation-errors">
        <h3>{errors.length} validation error(s) found</h3>
        <ul>
          {errors.map((error, i) => (
            <li key={i}>
              {error.rowIndex !== undefined && `Row ${error.rowIndex + 1}: `}
              {error.message}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}
```

---

## I18n (Internationalization)

Error codes are designed to be language-agnostic. The `message` field is a fallback in English, but you should translate errors based on the `code` and `params`:

```typescript
const errorMessages = {
  en: {
    PARSER_FAILED: 'Failed to parse the file. Please check the file format.',
    PARSER_NO_SHEETS: 'The file is empty or contains no data.',
    INVALID_EMAIL: 'Invalid email address',
    REQUIRED_FIELD_MISSING: 'This field is required',
  },
  es: {
    PARSER_FAILED: 'No se pudo procesar el archivo. Verifica el formato.',
    PARSER_NO_SHEETS: 'El archivo está vacío o no contiene datos.',
    INVALID_EMAIL: 'Dirección de correo inválida',
    REQUIRED_FIELD_MISSING: 'Este campo es obligatorio',
  },
};

function translateError(error: SheetError, locale: string): string {
  return errorMessages[locale]?.[error.code] ?? error.message ?? error.code;
}
```
