export type FieldValueType = 'number' | 'string' | 'bool' | 'date';
export type FieldInputType = 'input' | 'checkbox';

export type ValidatorOrWithParams = string | { readonly name: string; readonly params?: Readonly<Record<string, unknown>> };

export interface SheetLayoutField {
  readonly name: string;
  readonly description?: string;
  readonly example?: string;
  readonly validators?: readonly ValidatorOrWithParams[];
  readonly sanitizers?: readonly ValidatorOrWithParams[];
  readonly transformations?: readonly ValidatorOrWithParams[];
  readonly valueType?: FieldValueType;
  readonly inputType?: FieldInputType;
}

export interface SheetLayout {
  readonly name: string;
  readonly version: string | number;
  readonly description?: string;
  readonly sheetValidators?: readonly ValidatorOrWithParams[];
  readonly sheetSanitizers?: readonly ValidatorOrWithParams[];
  readonly rowValidators?: readonly ValidatorOrWithParams[];
  readonly rowSanitizers?: readonly ValidatorOrWithParams[];
  readonly rowTransformations?: readonly ValidatorOrWithParams[];
  readonly sheetTransformations?: readonly ValidatorOrWithParams[];
  readonly fields: Readonly<Record<string, SheetLayoutField>>;
}

export interface SheetLayoutRef {
  readonly name: string;
  readonly version: string | number;
}
